package com.campusbrand.controller;

import com.campusbrand.dto.AssetResponse;
import com.campusbrand.dto.AssetUpdateRequest;
import com.campusbrand.exception.ResourceNotFoundException;
import com.campusbrand.model.Asset;
import com.campusbrand.model.AssetCategory;
import com.campusbrand.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
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
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    public List<AssetResponse> getAll() {
        return assetService.findAll();
    }

    @GetMapping("/{id}")
    public AssetResponse getById(@PathVariable("id") Long id) {
        return assetService.findById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssetResponse> create(
        @RequestParam("name") String name,
        @RequestParam(name = "description", required = false, defaultValue = "") String description,
        @RequestParam("category") AssetCategory category,
        @RequestPart("file") MultipartFile file,
        Authentication authentication
    ) {
        return ResponseEntity.status(201).body(assetService.create(
            name, description, category, file, authentication.getName()
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public AssetResponse update(
        @PathVariable("id") Long id,
        @Valid @RequestBody AssetUpdateRequest request
    ) {
        return assetService.update(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        assetService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public List<AssetResponse> search(
        @RequestParam(name = "name", required = false) String name,
        @RequestParam(name = "category", required = false) AssetCategory category
    ) {
        return assetService.search(name, category);
    }

    @GetMapping("/category/{category}")
    public List<AssetResponse> category(@PathVariable("category") AssetCategory category) {
        return assetService.findByCategory(category);
    }

    @GetMapping("/preview/{id}")
    public ResponseEntity<Resource> preview(@PathVariable("id") Long id) {
        return serveFile(id, true);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(
        @PathVariable("id") Long id,
        @RequestParam(name = "inline", defaultValue = "false") boolean inline
    ) {
        return serveFile(id, inline);
    }

    private ResponseEntity<Resource> serveFile(Long id, boolean inline) {
        Asset asset = assetService.getEntity(id);
        Path path = assetService.resolveFilePath(asset);
        Resource resource = new FileSystemResource(path);
        if (!resource.exists()) {
            throw new ResourceNotFoundException("Asset file not found");
        }
        MediaType mediaType = mediaTypeFor(path);
        ContentDisposition disposition = (inline ? ContentDisposition.inline() : ContentDisposition.attachment())
            .filename(asset.getFileName(), StandardCharsets.UTF_8)
            .build();

        CacheControl cacheControl = CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic();

        return ResponseEntity.ok()
            .cacheControl(cacheControl)
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
            .header("X-Content-Type-Options", "nosniff")
            .header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'")
            .body(resource);
    }

    private MediaType mediaTypeFor(Path path) {
        try {
            String contentType = Files.probeContentType(path);
            return contentType == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(contentType);
        } catch (Exception exception) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
