package com.campusbrand.config;

import com.campusbrand.model.ApplicationStatus;
import com.campusbrand.model.Artwork;
import com.campusbrand.model.ArtworkRating;
import com.campusbrand.model.Asset;
import com.campusbrand.model.AssetCategory;
import com.campusbrand.model.CreatorApplication;
import com.campusbrand.model.CreatorProfile;
import com.campusbrand.model.User;
import com.campusbrand.model.UserRole;
import com.campusbrand.repository.ArtworkRatingRepository;
import com.campusbrand.repository.ArtworkRepository;
import com.campusbrand.repository.AssetRepository;
import com.campusbrand.repository.CreatorApplicationRepository;
import com.campusbrand.repository.CreatorProfileRepository;
import com.campusbrand.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final CreatorProfileRepository profileRepository;
    private final CreatorApplicationRepository applicationRepository;
    private final ArtworkRepository artworkRepository;
    private final ArtworkRatingRepository ratingRepository;
    private final PasswordEncoder passwordEncoder;
    private final javax.sql.DataSource dataSource;
    private final Path uploadDirectory;

    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;

    public DataInitializer(
        UserRepository userRepository,
        AssetRepository assetRepository,
        CreatorProfileRepository profileRepository,
        CreatorApplicationRepository applicationRepository,
        ArtworkRepository artworkRepository,
        ArtworkRatingRepository ratingRepository,
        PasswordEncoder passwordEncoder,
        javax.sql.DataSource dataSource,
        @Value("${app.upload.dir:uploads}") String uploadDir,
        @Value("${app.admin.email:admin@campusbrand.edu}") String adminEmail,
        @Value("${app.admin.password:Admin@123}") String adminPassword,
        @Value("${app.admin.name:Campus Admin}") String adminName
    ) {
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
        this.profileRepository = profileRepository;
        this.applicationRepository = applicationRepository;
        this.artworkRepository = artworkRepository;
        this.ratingRepository = ratingRepository;
        this.passwordEncoder = passwordEncoder;
        this.dataSource = dataSource;
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();

        String trimmed = adminEmail == null ? "" : adminEmail.trim().toLowerCase();
        this.adminEmail = trimmed.isBlank() ? "admin@campusbrand.edu" : trimmed;
        this.adminPassword = adminPassword == null || adminPassword.isBlank() ? "Admin@123" : adminPassword;
        this.adminName = adminName == null || adminName.isBlank() ? "Campus Admin" : adminName.trim();
    }

    @Override
    public void run(String... args) {
        try (var conn = dataSource.getConnection();
             var stmt = conn.createStatement()) {
            stmt.execute("ALTER TABLE users ALTER COLUMN role VARCHAR(50)");
            log.info("Successfully ensured users.role column is VARCHAR(50)");
        } catch (Exception e) {
            log.debug("Note on users.role column check: {}", e.getMessage());
        }

        try {
            Files.createDirectories(uploadDirectory);
        } catch (Exception ignored) {
        }

        // Generate genuine high-resolution PNG image files for all demo assets
        DemoPngGenerator.generateAll(uploadDirectory);

        // 1. Seed or synchronize Admin User
        User admin = userRepository.findByEmail(adminEmail).map(existing -> {
            existing.setPassword(passwordEncoder.encode(adminPassword));
            existing.setRole(UserRole.ADMIN);
            existing.setName(adminName);
            log.info("Synchronized administrator credentials: email={}, role=ADMIN", adminEmail);
            return userRepository.save(existing);
        }).orElseGet(() -> {
            User u = new User(adminName, adminEmail, passwordEncoder.encode(adminPassword), UserRole.ADMIN);
            log.info("Initialized default administrator: email={}, role=ADMIN", adminEmail);
            return userRepository.save(u);
        });

        // 2. Seed standard User (user@campusbrand.edu / User@123)
        User regularUser = userRepository.findByEmail("user@campusbrand.edu").map(existing -> {
            existing.setPassword(passwordEncoder.encode("User@123"));
            return userRepository.save(existing);
        }).orElseGet(() -> {
            User u = new User("Student User", "user@campusbrand.edu", passwordEncoder.encode("User@123"), UserRole.USER);
            return userRepository.save(u);
        });

        // 3. Seed Creator User (creator@campusbrand.edu / Creator@123)
        User creatorUser = userRepository.findByEmail("creator@campusbrand.edu").map(existing -> {
            existing.setRole(UserRole.CREATOR);
            existing.setPassword(passwordEncoder.encode("Creator@123"));
            return userRepository.save(existing);
        }).orElseGet(() -> {
            User u = new User("Aarav Sharma", "creator@campusbrand.edu", passwordEncoder.encode("Creator@123"), UserRole.CREATOR);
            return userRepository.save(u);
        });

        // 4. Seed CreatorProfile for creatorUser
        profileRepository.findByUser(creatorUser).ifPresentOrElse(
            p -> {},
            () -> {
                CreatorProfile profile = new CreatorProfile(
                    creatorUser,
                    "Aarav Sharma",
                    "Department of Design & Media",
                    "Lead visual designer for student activities, passionate about typography, layout systems, and bold campus branding.",
                    "Brand Identity, Poster Design, Vector Illustration, UI/UX"
                );
                profileRepository.save(profile);
            }
        );

        // 5. Seed sample approved CreatorApplication record for reference
        if (applicationRepository.findByApplicantOrderByCreatedAtDesc(creatorUser).isEmpty()) {
            CreatorApplication app = new CreatorApplication(
                creatorUser,
                "Department of Design & Media",
                "Brand Identity, Poster Design, Digital Layout",
                "Passionate student designer creating campus event branding and poster visuals.",
                "demo-art-cyber-summit.png,demo-art-campus-library.png"
            );
            app.setStatus(ApplicationStatus.APPROVED);
            app.setAdminFeedback("Outstanding portfolio quality and department alignment. Approved as verified campus creator.");
            app.setReviewedAt(LocalDateTime.now().minusDays(5));
            app.setReviewedBy(adminEmail);
            applicationRepository.save(app);
        } else {
            // Ensure existing application references PNGs
            applicationRepository.findByApplicantOrderByCreatedAtDesc(creatorUser).forEach(app -> {
                if (app.getSampleFiles() != null && app.getSampleFiles().contains(".svg")) {
                    app.setSampleFiles(app.getSampleFiles().replace(".svg", ".png"));
                    applicationRepository.save(app);
                }
            });
        }

        // 6. Migrate any existing database Asset records from SVG to PNG
        for (Asset asset : assetRepository.findAll()) {
            boolean updated = false;
            String original = asset.getFileName();
            String stored = asset.getFilePath();
            if (stored != null && stored.toLowerCase().endsWith(".svg")) {
                stored = stored.replaceAll("(?i)\\.svg$", ".png");
                updated = true;
            }
            if (original != null && original.toLowerCase().endsWith(".svg")) {
                original = original.replaceAll("(?i)\\.svg$", ".png");
                updated = true;
            }
            if (updated) {
                asset.updateFile(original, stored);
                assetRepository.save(asset);
                log.info("Migrated asset '{}' stored and original file to PNG", asset.getName());
            }
        }

        // 7. Migrate any existing database Artwork records from SVG to PNG
        for (Artwork artwork : artworkRepository.findAll()) {
            boolean updated = false;
            if (artwork.getFilePath() != null && artwork.getFilePath().toLowerCase().endsWith(".svg")) {
                artwork.setFilePath(artwork.getFilePath().replaceAll("(?i)\\.svg$", ".png"));
                updated = true;
            }
            if (artwork.getFileName() != null && artwork.getFileName().toLowerCase().endsWith(".svg")) {
                artwork.setFileName(artwork.getFileName().replaceAll("(?i)\\.svg$", ".png"));
                updated = true;
            }
            if (updated) {
                artworkRepository.save(artwork);
                log.info("Migrated artwork '{}' stored and original file to PNG", artwork.getTitle());
            }
        }

        // 8. Seed Realistic Demo Official Assets in PNG format
        seedAssetIfMissing(
            "Anurag University Official Crest & Seal",
            "Official institutional academic crest with seal and gold embellishments. Compliant with 2026 graduation and ceremony guidelines.",
            AssetCategory.LOGO,
            "demo-anurag-crest-logo.png",
            "demo-anurag-crest-logo.png",
            adminEmail
        );

        seedAssetIfMissing(
            "Innovision 2026 National Tech Symposium Poster",
            "Official high-resolution print & digital key visual poster for the annual CSE Tech Symposium and 24-hr Hackathon.",
            AssetCategory.POSTER,
            "demo-tech-fest-poster.png",
            "demo-tech-fest-poster.png",
            adminEmail
        );

        seedAssetIfMissing(
            "Student Activity Chapter Social Media Banner",
            "Standard 16:9 banner grid kit for student clubs, technical chapters, and guest lecture social announcements.",
            AssetCategory.TEMPLATE,
            "demo-banner-template.png",
            "demo-banner-template.png",
            adminEmail
        );

        seedAssetIfMissing(
            "Campus Visual Identity & Typography Guidelines",
            "Official university design manual detailing primary color palette (#0F172A, #4338CA), typography rules, and clearspace standards.",
            AssetCategory.GUIDELINE,
            "demo-brand-guidelines.png",
            "demo-brand-guidelines.png",
            adminEmail
        );

        // 9. Seed Demo Creator Artworks in PNG format
        Artwork art1 = seedArtworkIfMissing(
            "CyberShield 2026 Summit Identity",
            "Full visual identity system designed for the annual collegiate cybersecurity symposium and CTF competition.",
            "Branding",
            "demo-art-cyber-summit.png",
            "demo-art-cyber-summit.png",
            creatorUser
        );

        Artwork art2 = seedArtworkIfMissing(
            "Dawn at the Central Library",
            "Architectural vector silhouette capturing morning light over the Anurag central library complex.",
            "Illustration",
            "demo-art-campus-library.png",
            "demo-art-campus-library.png",
            creatorUser
        );

        Artwork art3 = seedArtworkIfMissing(
            "Robocon 2026 Key Visual",
            "Dynamic mechatronics event poster artwork showcasing the robotics team's national championship challenge.",
            "Poster",
            "demo-art-robocon.png",
            "demo-art-robocon.png",
            creatorUser
        );

        // 10. Seed Genuine 1-5 Star Ratings & Reviews
        if (art1 != null && !ratingRepository.existsByArtworkAndUser(art1, regularUser)) {
            ratingRepository.save(new ArtworkRating(art1, regularUser, 5, "Incredible logo composition! The cyber neon aesthetic fits the symposium perfectly."));
        }
        if (art1 != null && !ratingRepository.existsByArtworkAndUser(art1, admin)) {
            ratingRepository.save(new ArtworkRating(art1, admin, 5, "Approved and recommended by the design department. Excellent work."));
        }
        if (art2 != null && !ratingRepository.existsByArtworkAndUser(art2, regularUser)) {
            ratingRepository.save(new ArtworkRating(art2, regularUser, 5, "The color gradients are breathtaking. Looks like a professional book cover!"));
        }
        if (art3 != null && !ratingRepository.existsByArtworkAndUser(art3, regularUser)) {
            ratingRepository.save(new ArtworkRating(art3, regularUser, 4, "Strong, bold geometry. The typography could have a bit more margin, but overall 10/10."));
        }
    }

    private void seedAssetIfMissing(String name, String desc, AssetCategory cat, String originalName, String storedName, String uploader) {
        if (!assetRepository.existsByName(name)) {
            Asset asset = new Asset(name, desc, cat, originalName, storedName, uploader);
            assetRepository.save(asset);
            log.info("Seeded demo brand asset in PNG format: {}", name);
        }
    }

    private Artwork seedArtworkIfMissing(String title, String desc, String cat, String originalName, String storedName, User creator) {
        var existing = artworkRepository.findAll().stream()
            .filter(a -> a.getTitle().equalsIgnoreCase(title))
            .findFirst();
        if (existing.isPresent()) {
            return existing.get();
        }
        Artwork artwork = new Artwork(title, desc, cat, originalName, storedName, creator);
        Artwork saved = artworkRepository.save(artwork);
        log.info("Seeded creator artwork in PNG format: {}", title);
        return saved;
    }
}
