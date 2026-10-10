package com.campusbrand.controller;

import com.campusbrand.dto.ArtworkRatingRequest;
import com.campusbrand.dto.ArtworkRatingResponse;
import com.campusbrand.dto.ArtworkResponse;
import com.campusbrand.exception.ResourceNotFoundException;
import com.campusbrand.model.Artwork;
import com.campusbrand.service.ArtworkService;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/artworks")
public class ArtworkController {

    private final ArtworkService artworkService;

    public ArtworkController(ArtworkService artworkService) {
        this.artworkService = artworkService;
    }

    @GetMapping
    public List<ArtworkResponse> getAll(
        @RequestParam(name = "category", required = false) String category,
        @RequestParam(name = "search", required = false) String search,
        Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : null;
        if (search != null && !search.trim().isBlank()) {
            return artworkService.search(search, username);
        }
        if (category != null && !category.trim().isBlank()) {
            return artworkService.findByCategory(category, username);
        }
        return artworkService.findAll(username);
    }

    @GetMapping("/{id}")
    public ArtworkResponse getById(@PathVariable("id") Long id, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return artworkService.findById(id, username);
    }

    @GetMapping("/creator/{creatorId}")
    public List<ArtworkResponse> getByCreator(@PathVariable("creatorId") Long creatorId, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return artworkService.findByCreator(creatorId, username);
    }

    @PreAuthorize("hasRole('CREATOR') or hasRole('ADMIN')")
    @GetMapping("/my")
    public List<ArtworkResponse> getMyArtworks(Authentication authentication) {
        return artworkService.getMyArtworks(authentication.getName());
    }

    @PreAuthorize("hasRole('CREATOR') or hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArtworkResponse> create(
        @RequestParam("title") String title,
        @RequestParam(name = "description", required = false, defaultValue = "") String description,
        @RequestParam("category") String category,
        @RequestPart("file") MultipartFile file,
        Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            artworkService.create(title, description, category, file, authentication.getName())
        );
    }

    @PostMapping("/{id}/rate")
    public ArtworkResponse rate(
        @PathVariable("id") Long id,
        @Valid @RequestBody ArtworkRatingRequest request,
        Authentication authentication
    ) {
        return artworkService.rateArtwork(id, request, authentication.getName());
    }

    @GetMapping("/{id}/reviews")
    public List<ArtworkRatingResponse> getReviews(@PathVariable("id") Long id) {
        return artworkService.getArtworkReviews(id);
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<Map<String, String>> report(
        @PathVariable("id") Long id,
        @RequestBody(required = false) Map<String, String> body,
        Authentication authentication
    ) {
        String reason = body != null ? body.get("reason") : "Inappropriate content";
        artworkService.reportArtwork(id, reason, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Artwork reported for review"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/reported")
    public List<ArtworkResponse> getReported(Authentication authentication) {
        return artworkService.getReportedArtworks(authentication.getName());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/moderate")
    public ArtworkResponse moderate(
        @PathVariable("id") Long id,
        @RequestBody Map<String, Boolean> body,
        Authentication authentication
    ) {
        boolean hidden = body != null && Boolean.TRUE.equals(body.get("hidden"));
        return artworkService.moderateArtwork(id, hidden, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        artworkService.delete(id, authentication.getName(), isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preview/{id}")
    public ResponseEntity<Resource> preview(@PathVariable("id") Long id) {
        return serveArtworkFile(id, true);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable("id") Long id) {
        return serveArtworkFile(id, false);
    }

    private ResponseEntity<Resource> serveArtworkFile(Long id, boolean inline) {
        Artwork artwork = artworkService.getEntity(id);
        Path path = artworkService.resolveFilePath(artwork);
        Resource resource = new FileSystemResource(path);
        if (!resource.exists()) {
            throw new ResourceNotFoundException("Artwork file not found");
        }

        MediaType mediaType = mediaTypeFor(path);
        ContentDisposition disposition = (inline ? ContentDisposition.inline() : ContentDisposition.attachment())
            .filename(artwork.getFileName(), StandardCharsets.UTF_8)
            .build();

        CacheControl cacheControl = CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic();

        return ResponseEntity.ok()
            .cacheControl(cacheControl)
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
            .header("X-Content-Type-Options", "nosniff")
            .body(resource);
    }

    private MediaType mediaTypeFor(Path path) {
        String fileName = path.getFileName().toString().toLowerCase();
        if (fileName.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (fileName.endsWith(".svg")) return MediaType.parseMediaType("image/svg+xml");
        if (fileName.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        if (fileName.endsWith(".gif")) return MediaType.IMAGE_GIF;
        if (fileName.endsWith(".pdf")) return MediaType.APPLICATION_PDF;

        try {
            String contentType = Files.probeContentType(path);
            return contentType == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(contentType);
        } catch (Exception exception) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}

