package com.campusbrand.service;

import com.campusbrand.dto.AssetResponse;
import com.campusbrand.dto.AssetUpdateRequest;
import com.campusbrand.exception.ResourceNotFoundException;
import com.campusbrand.model.Asset;
import com.campusbrand.model.AssetCategory;
import com.campusbrand.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class AssetService {

    private static final List<String> ALLOWED_EXTENSIONS = List.of("png", "jpg", "jpeg", "svg", "webp", "gif", "pdf");

    private final AssetRepository assetRepository;
    private final Path uploadDirectory;

    public AssetService(
        AssetRepository assetRepository,
        @Value("${app.upload.dir:uploads}") String uploadDir
    ) {
        this.assetRepository = assetRepository;
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional
    public AssetResponse create(String name, String description, AssetCategory category,
                                MultipartFile file, String uploadedBy) {
        validateFile(file);
        try {
            Files.createDirectories(uploadDirectory);
            String rawOriginal = file.getOriginalFilename();
            String originalName = rawOriginal == null ? "file" : Path.of(rawOriginal).getFileName().toString();
            String storedName = UUID.randomUUID() + "-" + originalName;
            Path destination = uploadDirectory.resolve(storedName).normalize();
            if (!destination.startsWith(uploadDirectory)) {
                throw new IllegalArgumentException("Invalid file name");
            }
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            Asset asset = new Asset(
                name.trim(),
                description == null ? "" : description.trim(),
                category,
                originalName,
                storedName,
                uploadedBy
            );
            return AssetResponse.from(assetRepository.save(asset));
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to store the uploaded file", exception);
        }
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> findAll() {
        return assetRepository.findAllByOrderByCreatedAtDesc().stream().map(AssetResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Asset getEntity(Long id) {
        return assetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
    }

    @Transactional(readOnly = true)
    public AssetResponse findById(Long id) {
        return AssetResponse.from(getEntity(id));
    }

    @Transactional
    public AssetResponse update(Long id, AssetUpdateRequest request) {
        Asset asset = getEntity(id);
        asset.update(request.name().trim(), request.description() == null ? "" : request.description().trim(), request.category());
        return AssetResponse.from(assetRepository.save(asset));
    }

    @Transactional
    public void delete(Long id) {
        Asset asset = getEntity(id);
        try {
            Path filePath = resolveFilePath(asset);
            Files.deleteIfExists(filePath);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to delete the asset file", exception);
        }
        assetRepository.delete(asset);
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> search(String name, AssetCategory category) {
        boolean hasName = name != null && !name.trim().isBlank();
        if (category != null && hasName) {
            return assetRepository.findByCategoryAndNameContainingIgnoreCaseOrderByCreatedAtDesc(category, name.trim())
                .stream().map(AssetResponse::from).toList();
        } else if (category != null) {
            return assetRepository.findByCategoryOrderByCreatedAtDesc(category)
                .stream().map(AssetResponse::from).toList();
        } else if (hasName) {
            return assetRepository.findByNameContainingIgnoreCaseOrderByCreatedAtDesc(name.trim())
                .stream().map(AssetResponse::from).toList();
        }
        return findAll();
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> findByCategory(AssetCategory category) {
        return assetRepository.findByCategoryOrderByCreatedAtDesc(category).stream().map(AssetResponse::from).toList();
    }

    public Path resolveFilePath(Asset asset) {
        Path direct = Paths.get(asset.getFilePath());
        if (direct.isAbsolute() && Files.exists(direct) && direct.startsWith(uploadDirectory)) {
            return direct;
        }
        Path resolved = uploadDirectory.resolve(asset.getFilePath()).normalize();
        if (!resolved.startsWith(uploadDirectory)) {
            throw new SecurityException("Invalid file path: path traversal detected");
        }
        return resolved;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("A file is required");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || !ALLOWED_EXTENSIONS.contains(extensionOf(originalName))) {
            throw new IllegalArgumentException("Only PNG, JPG, JPEG, SVG, WEBP, GIF, and PDF files are supported");
        }
    }

    private String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot < 0 ? "" : fileName.substring(dot + 1).toLowerCase();
    }
}
