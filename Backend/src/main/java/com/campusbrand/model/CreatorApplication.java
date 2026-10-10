package com.campusbrand.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "creator_applications", indexes = {
    @Index(name = "idx_appl_status", columnList = "status"),
    @Index(name = "idx_appl_user", columnList = "user_id"),
    @Index(name = "idx_appl_created_at", columnList = "createdAt")
})
public class CreatorApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User applicant;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false, length = 1000)
    private String skills;

    @Column(nullable = false, length = 3000)
    private String bio;

    @Column(length = 3000)
    private String sampleFiles;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(length = 2000)
    private String adminFeedback;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    private String reviewedBy;

    protected CreatorApplication() {
    }

    public CreatorApplication(User applicant, String department, String skills, String bio, String sampleFiles) {
        this.applicant = applicant;
        this.department = department;
        this.skills = skills;
        this.bio = bio;
        this.sampleFiles = sampleFiles;
        this.status = ApplicationStatus.PENDING;
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public User getApplicant() {
        return applicant;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getSampleFiles() {
        return sampleFiles;
    }

    public void setSampleFiles(String sampleFiles) {
        this.sampleFiles = sampleFiles;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getAdminFeedback() {
        return adminFeedback;
    }

    public void setAdminFeedback(String adminFeedback) {
        this.adminFeedback = adminFeedback;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }
}

