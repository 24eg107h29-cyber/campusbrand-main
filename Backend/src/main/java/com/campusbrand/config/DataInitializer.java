package com.campusbrand.config;

import com.campusbrand.model.User;
import com.campusbrand.model.UserRole;
import com.campusbrand.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByRole(UserRole.ADMIN)) {
            User admin = new User(
                "Campus Admin",
                "admin@campusbrand.edu",
                passwordEncoder.encode("Admin@123"),
                UserRole.ADMIN
            );
            userRepository.save(admin);
            log.info("Initialized default admin user: email=admin@campusbrand.edu, role=ADMIN");
        }
    }
}
