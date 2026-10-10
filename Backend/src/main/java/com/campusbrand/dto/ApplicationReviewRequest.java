package com.campusbrand.dto;

import com.campusbrand.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationReviewRequest(
    @NotNull(message = "Review status is required")
    ApplicationStatus status,
    String feedback
) {}

