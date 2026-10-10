package com.campusbrand.dto;

import com.campusbrand.model.CreatorProfile;

public record CreatorProfileResponse(
    Long id,
    Long userId,
    String name,
    String email,
    String displayName,
    String department,
    String bio,
    String skills,
    String avatarFileName,
    String portfolioUrl,
    long artworkCount,
    double averageRating
) {
    public static CreatorProfileResponse from(CreatorProfile profile, long artworkCount, double averageRating) {
        return new CreatorProfileResponse(
            profile.getId(),
            profile.getUser().getId(),
            profile.getUser().getName(),
            profile.getUser().getEmail(),
            profile.getDisplayName(),
            profile.getDepartment(),
            profile.getBio(),
            profile.getSkills(),
            profile.getAvatarFileName(),
            profile.getPortfolioUrl(),
            artworkCount,
            Math.round(averageRating * 10.0) / 10.0
        );
    }
}

