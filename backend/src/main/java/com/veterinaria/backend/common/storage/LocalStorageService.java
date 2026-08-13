package com.veterinaria.backend.common.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    @Value("${storage.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    public String save(MultipartFile file, StorageFolder folder) {
        try {
            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path folderPath = basePath.resolve(folder.getFolder()).normalize();

            if (!folderPath.startsWith(basePath)) {
                throw new SecurityException("Invalid storage folder");
            }

            Files.createDirectories(folderPath);

            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() +
                    (extension != null ? "." + extension : "");

            Path destination = folderPath.resolve(filename).normalize();

            if (!destination.startsWith(folderPath)) {
                throw new SecurityException("Invalid file path");
            }

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            return folder.getFolder() + "/" + filename;

        } catch (IOException e) {
            throw new RuntimeException("Error saving file", e);
        }
    }

    @Override
    public void delete(String relativePath) {
        try {
            if (relativePath == null || relativePath.isBlank()) {
                return;
            }

            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path path = basePath.resolve(relativePath).normalize();

            if (!path.startsWith(basePath)) {
                throw new SecurityException("Invalid file path: potential path traversal");
            }

            Files.deleteIfExists(path);

        } catch (IOException e) {
            throw new RuntimeException("Error deleting file", e);
        }
    }

    @Override
    public String resolveUrl(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return null;
        }
        // Already an absolute URL (e.g. future S3/MinIO migration) — return as-is
        if (relativePath.startsWith("http")) {
            return relativePath;
        }
        // context-path is /api, uploads are served under /api/uploads/**
        return baseUrl + "/api/uploads/" + relativePath;
    }
}