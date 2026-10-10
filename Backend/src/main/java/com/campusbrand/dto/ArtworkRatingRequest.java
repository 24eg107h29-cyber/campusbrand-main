package com.campusbrand.dto;

import com.campusbrand.model.ArtworkRating;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record ArtworkRatingRequest(
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1 star")
    @Max(value = 5, message = "Rating cannot exceed 5 stars")
    Integer rating,

    @Size(max = 1500, message = "Review must not exceed 1500 characters")
    String review
) {}

