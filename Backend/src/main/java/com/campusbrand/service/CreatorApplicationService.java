package com.campusbrand.service;

import com.campusbrand.dto.ApplicationReviewRequest;
import com.campusbrand.dto.CreatorApplicationResponse;
import com.campusbrand.exception.ResourceNotFoundException;
import com.campusbrand.model.ApplicationStatus;
import com.campusbrand.model.CreatorApplication;
import com.campusbrand.model.CreatorProfile;
import com.campusbrand.model.User;
import com.campusbrand.model.UserRole;
import com.campusbrand.repository.CreatorApplicationRepository;
import com.campusbrand.repository.CreatorProfileRepository;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CreatorApplicationService {

    private static final List<String> ALLOWED_EXTENSIONS = List.of("png", "jpg", "jpeg", "svg", "webp", "pdf");

    private final CreatorApplicationRepository applicationRepository;
    private final CreatorProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final Path uploadDirectory;

    public CreatorApplicationService(
        CreatorApplicationRepository applicationRepository,
        CreatorProfileRepository profileRepository,
        UserRepository userRepository,
        @Value("${app.upload.dir:uploads}") String uploadDir
    ) {
        this.applicationRepository = applicationRepository;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional
    public CreatorApplicationResponse apply(
        String department,
        String skills,
        String bio,
        List<MultipartFile> sampleFiles,
        String userEmail
    ) {
        User user = userRepository.findByEmail(userEmail.trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (department == null || department.trim().isBlank()) {
            throw new IllegalArgumentException("Department is required");
        }
        if (skills == null || skills.trim().isBlank()) {
            throw new IllegalArgumentException("Creative skills are required");
        }
        if (bio == null || bio.trim().isBlank()) {
            throw new IllegalArgumentException("Bio is required");
        }

        // Save uploaded samples securely
        List<String> storedNames = new ArrayList<>();
        if (sampleFiles != null && !sampleFiles.isEmpty()) {
            try {
                Files.createDirectories(uploadDirectory);
                for (MultipartFile file : sampleFiles) {
                    if (file.isEmpty()) continue;
                    validateSampleFile(file);
                    String rawOriginal = file.getOriginalFilename();
                    String originalName = rawOriginal == null ? "sample" : Path.of(rawOriginal).getFileName().toString();
                    String storedName = "sample-" + UUID.randomUUID() + "-" + originalName;
                    Path destination = uploadDirectory.resolve(storedName).normalize();
                    if (!destination.startsWith(uploadDirectory)) {
                        throw new IllegalArgumentException("Invalid file name");
                    }
                    Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                    storedNames.add(storedName);
                }
            } catch (IOException e) {
                throw new IllegalStateException("Failed to store sample files", e);
            }
        }

        CreatorApplication application = new CreatorApplication(
            user,
            department.trim(),
            skills.trim(),
            bio.trim(),
            String.join(",", storedNames)
        );

        return CreatorApplicationResponse.from(applicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public CreatorApplicationResponse getMyApplication(String userEmail) {
        User user = userRepository.findByEmail(userEmail.trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return applicationRepository.findFirstByApplicantOrderByCreatedAtDesc(user)
            .map(CreatorApplicationResponse::from)
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<CreatorApplicationResponse> getAllApplications() {
        return applicationRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(CreatorApplicationResponse::from)
            .toList();
    }

    @Transactional
    public CreatorApplicationResponse review(Long id, ApplicationReviewRequest request, String adminEmail) {
        CreatorApplication application = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        application.setStatus(request.status());
        application.setAdminFeedback(request.feedback() == null ? "" : request.feedback().trim());
        application.setReviewedAt(LocalDateTime.now());
        application.setReviewedBy(adminEmail);

        if (request.status() == ApplicationStatus.APPROVED) {
            User applicant = application.getApplicant();
            applicant.setRole(UserRole.CREATOR);
            userRepository.save(applicant);

            // Initialize creator profile if not existing
            profileRepository.findByUser(applicant).ifPresentOrElse(
                profile -> {
                    profile.setDepartment(application.getDepartment());
                    profile.setBio(application.getBio());
                    profile.setSkills(application.getSkills());
                    profileRepository.save(profile);
                },
                () -> {
                    CreatorProfile profile = new CreatorProfile(
                        applicant,
                        applicant.getName(),
                        application.getDepartment(),
                        application.getBio(),
                        application.getSkills()
                    );
                    profileRepository.save(profile);
                }
            );
        }

        return CreatorApplicationResponse.from(applicationRepository.save(application));
    }

    public Path resolveSamplePath(String storedName) {
        Path resolved = uploadDirectory.resolve(storedName).normalize();
        if (!resolved.startsWith(uploadDirectory)) {
            throw new SecurityException("Invalid file path");
        }
        return resolved;
    }

    private void validateSampleFile(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            throw new IllegalArgumentException("File name missing");
        }
        int dot = originalName.lastIndexOf('.');
        String ext = dot < 0 ? "" : originalName.substring(dot + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("Unsupported file type: " + ext + ". Allowed: PNG, JPG, JPEG, SVG, WEBP, PDF");
        }
    }
}

