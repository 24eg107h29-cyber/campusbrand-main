package com.campusbrand.dto;

import com.campusbrand.model.ArtworkRating;

import java.time.LocalDateTime;

public record ArtworkRatingResponse(
    Long id,
    Long userId,
    String userName,
    Integer rating,
    String review,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ArtworkRatingResponse from(ArtworkRating r) {
        return new ArtworkRatingResponse(
            r.getId(),
            r.getUser().getId(),
            r.getUser().getName(),
            r.getRating(),
            r.getReview(),
            r.getCreatedAt(),
            r.getUpdatedAt()
        );
    }
}

