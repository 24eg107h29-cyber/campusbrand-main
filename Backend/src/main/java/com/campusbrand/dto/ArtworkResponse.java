package com.campusbrand.dto;

import com.campusbrand.model.Artwork;

import java.time.LocalDateTime;

public record ArtworkResponse(
    Long id,
    String title,
    String description,
    String category,
    String fileName,
    Long creatorId,
    String creatorName,
    String creatorEmail,
    LocalDateTime createdAt,
    boolean hidden,
    boolean reported,
    String reportReason,
    double averageRating,
    long ratingCount,
    Integer userRating,
    String previewUrl,
    String downloadUrl
) {
    public static ArtworkResponse from(Artwork art, double avgRating, long count, Integer currentUserRating) {
        return new ArtworkResponse(
            art.getId(),
            art.getTitle(),
            art.getDescription(),
            art.getCategory(),
            art.getFileName(),
            art.getCreator().getId(),
            art.getCreator().getName(),
            art.getCreator().getEmail(),
            art.getCreatedAt(),
            art.isHidden(),
            art.isReported(),
            art.getReportReason(),
            Math.round(avgRating * 10.0) / 10.0,
            count,
            currentUserRating,
            "/api/artworks/preview/" + art.getId(),
            "/api/artworks/download/" + art.getId()
        );
    }
}

