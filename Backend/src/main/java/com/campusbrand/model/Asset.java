package com.campusbrand.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetCategory category;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String uploadedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Asset() {
    }

    public Asset(String name, String description, AssetCategory category,
                 String fileName, String filePath, String uploadedBy) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.fileName = fileName;
        this.filePath = filePath;
        this.uploadedBy = uploadedBy;
    }

    @PrePersist
    void setCreatedAt() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public AssetCategory getCategory() {
        return category;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void update(String name, String description, AssetCategory category) {
        this.name = name;
        this.description = description;
        this.category = category;
    }

    public void updateFile(String fileName, String filePath) {
        this.fileName = fileName;
        this.filePath = filePath;
    }
}
