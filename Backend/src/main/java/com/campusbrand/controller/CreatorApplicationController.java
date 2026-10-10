package com.campusbrand.controller;

import com.campusbrand.dto.ApplicationReviewRequest;
import com.campusbrand.dto.CreatorApplicationResponse;
import com.campusbrand.exception.ResourceNotFoundException;
import com.campusbrand.service.CreatorApplicationService;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/creator-applications")
public class CreatorApplicationController {

    private final CreatorApplicationService applicationService;

    public CreatorApplicationController(CreatorApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CreatorApplicationResponse> apply(
        @RequestParam("department") String department,
        @RequestParam("skills") String skills,
        @RequestParam("bio") String bio,
        @RequestPart(name = "sampleFiles", required = false) List<MultipartFile> sampleFiles,
        Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            applicationService.apply(department, skills, bio, sampleFiles, authentication.getName())
        );
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyApplication(Authentication authentication) {
        CreatorApplicationResponse app = applicationService.getMyApplication(authentication.getName());
        if (app == null) {
            return ResponseEntity.ok(Map.of("hasApplication", false));
        }
        return ResponseEntity.ok(Map.of("hasApplication", true, "application", app));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<CreatorApplicationResponse> getAllApplications() {
        return applicationService.getAllApplications();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/review")
    public CreatorApplicationResponse review(
        @PathVariable("id") Long id,
        @Valid @RequestBody ApplicationReviewRequest request,
        Authentication authentication
    ) {
        return applicationService.review(id, request, authentication.getName());
    }

    @GetMapping("/sample/{fileName}")
    public ResponseEntity<Resource> serveSample(@PathVariable("fileName") String fileName) {
        Path path = applicationService.resolveSamplePath(fileName);
        Resource resource = new FileSystemResource(path);
        if (!resource.exists()) {
            throw new ResourceNotFoundException("Sample file not found");
        }

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String probe = Files.probeContentType(path);
            if (probe != null) {
                mediaType = MediaType.parseMediaType(probe);
            }
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
            .body(resource);
    }
}

