package com.campusbrand.dto;

import com.campusbrand.model.ApplicationStatus;
import com.campusbrand.model.CreatorApplication;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public record CreatorApplicationResponse(
    Long id,
    Long applicantId,
    String applicantName,
    String applicantEmail,
    String department,
    String skills,
    String bio,
    List<String> sampleFiles,
    ApplicationStatus status,
    String adminFeedback,
    LocalDateTime createdAt,
    LocalDateTime reviewedAt,
    String reviewedBy
) {
    public static CreatorApplicationResponse from(CreatorApplication app) {
        List<String> files = Collections.emptyList();
        if (app.getSampleFiles() != null && !app.getSampleFiles().isBlank()) {
            files = Arrays.stream(app.getSampleFiles().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        }
        return new CreatorApplicationResponse(
            app.getId(),
            app.getApplicant().getId(),
            app.getApplicant().getName(),
            app.getApplicant().getEmail(),
            app.getDepartment(),
            app.getSkills(),
            app.getBio(),
            files,
            app.getStatus(),
            app.getAdminFeedback(),
            app.getCreatedAt(),
            app.getReviewedAt(),
            app.getReviewedBy()
        );
    }
}

