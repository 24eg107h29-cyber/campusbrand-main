package com.campusbrand.config;

import com.campusbrand.model.User;
import com.campusbrand.model.UserRole;
import com.campusbrand.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;

    public DataInitializer(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.admin.email:admin@campusbrand.edu}") String adminEmail,
        @Value("${app.admin.password:Admin@123}") String adminPassword,
        @Value("${app.admin.name:Campus Admin}") String adminName
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail == null ? "admin@campusbrand.edu" : adminEmail.trim().toLowerCase();
        this.adminPassword = adminPassword;
        this.adminName = adminName;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByRole(UserRole.ADMIN)) {
            User admin = new User(
                adminName,
                adminEmail,
                passwordEncoder.encode(adminPassword),
                UserRole.ADMIN
            );
            userRepository.save(admin);
            log.info("Initialized default administrator: email={}, role=ADMIN", adminEmail);
        }
    }
}
