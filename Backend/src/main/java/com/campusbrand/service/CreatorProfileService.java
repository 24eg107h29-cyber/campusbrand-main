package com.campusbrand.service;

import com.campusbrand.dto.CreatorProfileResponse;
import com.campusbrand.dto.CreatorProfileUpdateRequest;
import com.campusbrand.exception.ResourceNotFoundException;
import com.campusbrand.model.CreatorProfile;
import com.campusbrand.model.User;
import com.campusbrand.model.UserRole;
import com.campusbrand.repository.ArtworkRatingRepository;
import com.campusbrand.repository.ArtworkRepository;
import com.campusbrand.repository.CreatorProfileRepository;
import com.campusbrand.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CreatorProfileService {

    private final CreatorProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ArtworkRepository artworkRepository;
    private final ArtworkRatingRepository ratingRepository;

    public CreatorProfileService(
        CreatorProfileRepository profileRepository,
        UserRepository userRepository,
        ArtworkRepository artworkRepository,
        ArtworkRatingRepository ratingRepository
    ) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.artworkRepository = artworkRepository;
        this.ratingRepository = ratingRepository;
    }

    @Transactional(readOnly = true)
    public List<CreatorProfileResponse> listApprovedCreators() {
        List<User> creators = userRepository.findAll().stream()
            .filter(u -> u.getRole() == UserRole.CREATOR || u.getRole() == UserRole.ADMIN)
            .toList();

        List<CreatorProfileResponse> result = new ArrayList<>();
        for (User user : creators) {
            CreatorProfile profile = profileRepository.findByUser(user).orElseGet(() -> {
                CreatorProfile p = new CreatorProfile(user, user.getName(), "Design Department", "Campus Brand Creator", "Branding, Visual Design");
                return profileRepository.save(p);
            });

            long artworkCount = artworkRepository.countByCreatorAndHiddenFalse(user);
            double avg = calculateCreatorAverageRating(user);
            result.add(CreatorProfileResponse.from(profile, artworkCount, avg));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public CreatorProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Creator not found"));

        CreatorProfile profile = profileRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("Creator profile not found"));

        long artworkCount = artworkRepository.countByCreatorAndHiddenFalse(user);
        double avg = calculateCreatorAverageRating(user);
        return CreatorProfileResponse.from(profile, artworkCount, avg);
    }

    @Transactional(readOnly = true)
    public CreatorProfileResponse getMyProfile(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CreatorProfile profile = profileRepository.findByUser(user).orElseGet(() -> {
            CreatorProfile p = new CreatorProfile(user, user.getName(), "Design & Media", "Creative designer on CampusBrand", "Visual Design");
            return profileRepository.save(p);
        });

        long artworkCount = artworkRepository.countByCreatorAndHiddenFalse(user);
        double avg = calculateCreatorAverageRating(user);
        return CreatorProfileResponse.from(profile, artworkCount, avg);
    }

    @Transactional
    public CreatorProfileResponse updateMyProfile(CreatorProfileUpdateRequest request, String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CreatorProfile profile = profileRepository.findByUser(user).orElseGet(() ->
            new CreatorProfile(user, user.getName(), "", "", "")
        );

        profile.setDisplayName(request.displayName().trim());
        profile.setDepartment(request.department() == null ? "" : request.department().trim());
        profile.setBio(request.bio() == null ? "" : request.bio().trim());
        profile.setSkills(request.skills() == null ? "" : request.skills().trim());
        profile.setPortfolioUrl(request.portfolioUrl() == null ? "" : request.portfolioUrl().trim());

        CreatorProfile saved = profileRepository.save(profile);
        long artworkCount = artworkRepository.countByCreatorAndHiddenFalse(user);
        double avg = calculateCreatorAverageRating(user);
        return CreatorProfileResponse.from(saved, artworkCount, avg);
    }

    private double calculateCreatorAverageRating(User creator) {
        var works = artworkRepository.findByCreatorAndHiddenFalseOrderByCreatedAtDesc(creator);
        if (works.isEmpty()) return 0.0;
        double sum = 0.0;
        int count = 0;
        for (var art : works) {
            Double avg = ratingRepository.findAverageRatingByArtwork(art);
            if (avg != null && avg > 0) {
                sum += avg;
                count++;
            }
        }
        return count == 0 ? 0.0 : sum / count;
    }
}

