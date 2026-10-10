package com.campusbrand.service;

import com.campusbrand.dto.ArtworkRatingRequest;
import com.campusbrand.dto.ArtworkRatingResponse;
import com.campusbrand.dto.ArtworkResponse;
import com.campusbrand.exception.ResourceNotFoundException;
import com.campusbrand.model.Artwork;
import com.campusbrand.model.ArtworkRating;
import com.campusbrand.model.User;
import com.campusbrand.model.UserRole;
import com.campusbrand.repository.ArtworkRatingRepository;
import com.campusbrand.repository.ArtworkRepository;
import com.campusbrand.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class ArtworkService {

    private static final List<String> ALLOWED_EXTENSIONS = List.of("png", "jpg", "jpeg", "svg", "webp", "gif", "pdf");

    private final ArtworkRepository artworkRepository;
    private final ArtworkRatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final Path uploadDirectory;

    public ArtworkService(
        ArtworkRepository artworkRepository,
        ArtworkRatingRepository ratingRepository,
        UserRepository userRepository,
        @Value("${app.upload.dir:uploads}") String uploadDir
    ) {
        this.artworkRepository = artworkRepository;
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional
    public ArtworkResponse create(
        String title,
        String description,
        String category,
        MultipartFile file,
        String creatorEmail
    ) {
        User creator = userRepository.findByEmail(creatorEmail.trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("Creator not found"));

        if (creator.getRole() != UserRole.CREATOR && creator.getRole() != UserRole.ADMIN) {
            throw new SecurityException("Only approved creators or administrators can publish artworks");
        }

        if (title == null || title.trim().isBlank()) {
            throw new IllegalArgumentException("Artwork title is required");
        }
        if (category == null || category.trim().isBlank()) {
            throw new IllegalArgumentException("Category is required");
        }

        validateFile(file);

        try {
            Files.createDirectories(uploadDirectory);
            String rawOriginal = file.getOriginalFilename();
            String originalName = rawOriginal == null ? "art" : Path.of(rawOriginal).getFileName().toString();
            String storedName = "art-" + UUID.randomUUID() + "-" + originalName;
            Path destination = uploadDirectory.resolve(storedName).normalize();
            if (!destination.startsWith(uploadDirectory)) {
                throw new IllegalArgumentException("Invalid file name");
            }
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            Artwork artwork = new Artwork(
                title.trim(),
                description == null ? "" : description.trim(),
                category.trim(),
                originalName,
                storedName,
                creator
            );

            Artwork saved = artworkRepository.save(artwork);
            return toDto(saved, creatorEmail);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store artwork file", e);
        }
    }

    @Transactional(readOnly = true)
    public List<ArtworkResponse> findAll(String currentUsername) {
        return artworkRepository.findByHiddenFalseOrderByCreatedAtDesc().stream()
            .map(art -> toDto(art, currentUsername))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ArtworkResponse> findByCategory(String category, String currentUsername) {
        return artworkRepository.findByHiddenFalseAndCategoryIgnoreCaseOrderByCreatedAtDesc(category).stream()
            .map(art -> toDto(art, currentUsername))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ArtworkResponse> search(String query, String currentUsername) {
        if (query == null || query.trim().isBlank()) {
            return findAll(currentUsername);
        }
        return artworkRepository.searchArtworks(query.trim()).stream()
            .map(art -> toDto(art, currentUsername))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ArtworkResponse> findByCreator(Long creatorId, String currentUsername) {
        User creator = userRepository.findById(creatorId)
            .orElseThrow(() -> new ResourceNotFoundException("Creator not found"));
        return artworkRepository.findByCreatorAndHiddenFalseOrderByCreatedAtDesc(creator).stream()
            .map(art -> toDto(art, currentUsername))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ArtworkResponse> getMyArtworks(String email) {
        User creator = userRepository.findByEmail(email.trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return artworkRepository.findByCreatorOrderByCreatedAtDesc(creator).stream()
            .map(art -> toDto(art, email))
            .toList();
    }

    @Transactional(readOnly = true)
    public ArtworkResponse findById(Long id, String currentUsername) {
        Artwork artwork = getEntity(id);
        return toDto(artwork, currentUsername);
    }

    @Transactional(readOnly = true)
    public Artwork getEntity(Long id) {
        return artworkRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Artwork not found"));
    }

    @Transactional
    public ArtworkResponse rateArtwork(Long artworkId, ArtworkRatingRequest request, String userEmail) {
        Artwork artwork = getEntity(artworkId);
        User user = userRepository.findByEmail(userEmail.trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Rule: Creator cannot rate their own work
        if (artwork.getCreator().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Creators cannot rate their own artworks");
        }

        if (request.rating() == null || request.rating() < 1 || request.rating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5 stars");
        }

        ratingRepository.findByArtworkAndUser(artwork, user).ifPresentOrElse(
            existing -> {
                existing.setRating(request.rating());
                existing.setReview(request.review() == null ? "" : request.review().trim());
                ratingRepository.save(existing);
            },
            () -> {
                ArtworkRating rating = new ArtworkRating(
                    artwork,
                    user,
                    request.rating(),
                    request.review() == null ? "" : request.review().trim()
                );
                ratingRepository.save(rating);
            }
        );

        return toDto(artwork, userEmail);
    }

    @Transactional(readOnly = true)
    public List<ArtworkRatingResponse> getArtworkReviews(Long artworkId) {
        Artwork artwork = getEntity(artworkId);
        return ratingRepository.findByArtworkOrderByCreatedAtDesc(artwork).stream()
            .map(ArtworkRatingResponse::from)
            .toList();
    }

    @Transactional
    public void reportArtwork(Long artworkId, String reason, String reporterEmail) {
        Artwork artwork = getEntity(artworkId);
        artwork.setReported(true);
        String details = "Reported by " + reporterEmail + ": " + (reason == null ? "Inappropriate content" : reason.trim());
        artwork.setReportReason(details);
        artworkRepository.save(artwork);
    }

    @Transactional
    public ArtworkResponse moderateArtwork(Long artworkId, boolean hide, String adminEmail) {
        Artwork artwork = getEntity(artworkId);
        artwork.setHidden(hide);
        return toDto(artworkRepository.save(artwork), adminEmail);
    }

    @Transactional(readOnly = true)
    public List<ArtworkResponse> getReportedArtworks(String adminEmail) {
        return artworkRepository.findByReportedTrueOrderByCreatedAtDesc().stream()
            .map(art -> toDto(art, adminEmail))
            .toList();
    }

    @Transactional
    public void delete(Long artworkId, String userEmail, boolean isAdmin) {
        Artwork artwork = getEntity(artworkId);
        if (!isAdmin && !artwork.getCreator().getEmail().equalsIgnoreCase(userEmail.trim())) {
            throw new SecurityException("You do not have permission to delete this artwork");
        }
        try {
            Path path = resolveFilePath(artwork);
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
        artworkRepository.delete(artwork);
    }

    public Path resolveFilePath(Artwork artwork) {
        Path direct = Paths.get(artwork.getFilePath());
        if (direct.isAbsolute() && Files.exists(direct) && direct.startsWith(uploadDirectory)) {
            return direct;
        }
        Path resolved = uploadDirectory.resolve(artwork.getFilePath()).normalize();
        if (!resolved.startsWith(uploadDirectory)) {
            throw new SecurityException("Invalid file path: path traversal detected");
        }
        return resolved;
    }

    private ArtworkResponse toDto(Artwork artwork, String currentUsername) {
        Double avg = ratingRepository.findAverageRatingByArtwork(artwork);
        long count = ratingRepository.countByArtwork(artwork);
        Integer userRating = null;
        if (currentUsername != null && !currentUsername.isBlank()) {
            userRepository.findByEmail(currentUsername.trim().toLowerCase()).ifPresent(user -> {
                ratingRepository.findByArtworkAndUser(artwork, user).ifPresent(r -> {
                    // captured in final
                });
            });
            var userOpt = userRepository.findByEmail(currentUsername.trim().toLowerCase());
            if (userOpt.isPresent()) {
                var rOpt = ratingRepository.findByArtworkAndUser(artwork, userOpt.get());
                if (rOpt.isPresent()) {
                    userRating = rOpt.get().getRating();
                }
            }
        }
        return ArtworkResponse.from(artwork, avg == null ? 0.0 : avg, count, userRating);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("An image or artwork file is required");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            throw new IllegalArgumentException("File name is missing");
        }
        int dot = originalName.lastIndexOf('.');
        String ext = dot < 0 ? "" : originalName.substring(dot + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("Unsupported file type: " + ext);
        }
    }
}

