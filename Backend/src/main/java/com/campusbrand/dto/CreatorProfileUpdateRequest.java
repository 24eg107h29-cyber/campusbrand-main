package com.campusbrand.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatorProfileUpdateRequest(
    @NotBlank(message = "Display name is required")
    String displayName,
    String department,
    @Size(max = 3000, message = "Bio must not exceed 3000 characters")
    String bio,
    String skills,
    String portfolioUrl
) {}

