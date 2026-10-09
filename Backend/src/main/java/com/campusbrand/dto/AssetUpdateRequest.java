package com.campusbrand.dto;

import com.campusbrand.model.AssetCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AssetUpdateRequest(
    @NotBlank(message = "Name is required")
    String name,

    String description,

    @NotNull(message = "Category is required")
    AssetCategory category
) {
}
