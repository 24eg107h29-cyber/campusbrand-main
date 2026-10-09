package com.campusbrand.dto;

import com.campusbrand.model.Asset;

import java.time.LocalDateTime;

public record AssetResponse(
    Long id,
    String name,
    String description,
    String category,
    String fileName,
    String uploadedBy,
    LocalDateTime createdAt,
    String downloadUrl
) {
    public static AssetResponse from(Asset asset) {
        return new AssetResponse(
            asset.getId(),
            asset.getName(),
            asset.getDescription(),
            asset.getCategory().name(),
            asset.getFileName(),
            asset.getUploadedBy(),
            asset.getCreatedAt(),
            "/api/assets/download/" + asset.getId()
        );
    }
}
