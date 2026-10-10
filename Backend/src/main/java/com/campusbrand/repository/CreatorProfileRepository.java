package com.campusbrand.repository;

import com.campusbrand.model.CreatorProfile;
import com.campusbrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, Long> {
    Optional<CreatorProfile> findByUser(User user);
    Optional<CreatorProfile> findByUserId(Long userId);
}

