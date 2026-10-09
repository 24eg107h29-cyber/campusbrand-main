package com.campusbrand.repository;

import com.campusbrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import com.campusbrand.model.UserRole;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRole(UserRole role);
}

