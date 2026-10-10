package com.campusbrand.repository;

import com.campusbrand.model.ApplicationStatus;
import com.campusbrand.model.CreatorApplication;
import com.campusbrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreatorApplicationRepository extends JpaRepository<CreatorApplication, Long> {
    List<CreatorApplication> findAllByOrderByCreatedAtDesc();
    List<CreatorApplication> findByApplicantOrderByCreatedAtDesc(User applicant);
    Optional<CreatorApplication> findFirstByApplicantOrderByCreatedAtDesc(User applicant);
    long countByStatus(ApplicationStatus status);
}

