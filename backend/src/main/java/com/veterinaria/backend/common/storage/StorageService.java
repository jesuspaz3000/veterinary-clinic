package com.veterinaria.backend.common.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String save(MultipartFile file, StorageFolder folder);

    void delete(String relativePath);

    /** Converts a relative path (e.g. "users/abc.jpg") to a fully-qualified public URL. */
    String resolveUrl(String relativePath);

    /**
     * Handles updating an optional file (uploading a new one, deleting the old one, or removing it).
     */
    default String updateFile(MultipartFile file, String currentPath, Boolean removeFile, StorageFolder folder) {
        if (file != null && !file.isEmpty()) {
            String newPath = save(file, folder);
            if (currentPath != null) {
                try {
                    delete(currentPath);
                } catch (Exception e) {
                    // Suppress or log locally (cannot easily log with lombok slf4j in interface, but try/catch protects flow)
                }
            }
            return newPath;
        } else if (Boolean.TRUE.equals(removeFile)) {
            if (currentPath != null) {
                try {
                    delete(currentPath);
                } catch (Exception e) {
                }
            }
            return null;
        }
        return currentPath;
    }

}
