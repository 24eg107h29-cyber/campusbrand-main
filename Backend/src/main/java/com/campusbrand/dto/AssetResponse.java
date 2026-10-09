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
    String downloadUrl,
    String previewUrl,
    String fileType
) {
    public AssetResponse(
        Long id,
        String name,
        String description,
        String category,
        String fileName,
        String uploadedBy,
        LocalDateTime createdAt,
        String downloadUrl
    ) {
        this(
            id,
            name,
            description,
            category,
            fileName,
            uploadedBy,
            createdAt,
            downloadUrl,
            "/api/assets/preview/" + id,
            extractExtension(fileName)
        );
    }

    public static AssetResponse from(Asset asset) {
        String ext = extractExtension(asset.getFileName());
        return new AssetResponse(
            asset.getId(),
            asset.getName(),
            asset.getDescription(),
            asset.getCategory().name(),
            asset.getFileName(),
            asset.getUploadedBy(),
            asset.getCreatedAt(),
            "/api/assets/download/" + asset.getId(),
            "/api/assets/preview/" + asset.getId(),
            ext
        );
    }

    private static String extractExtension(String fileName) {
        if (fileName == null || fileName.isBlank()) return "FILE";
        int dot = fileName.lastIndexOf('.');
        if (dot < 0 || dot == fileName.length() - 1) return "FILE";
        return fileName.substring(dot + 1).toUpperCase();
    }
}
