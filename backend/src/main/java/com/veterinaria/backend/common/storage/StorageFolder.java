package com.veterinaria.backend.common.storage;

import lombok.Getter;

@Getter
public enum StorageFolder {
    USERS("users"),
    PETS("pets"),
    PRODUCTS("products"),
    MEDICAL_DOCUMENTS("medical_documents"),
    PET_PHOTOS("pet_photos");

    private final String folder;

    StorageFolder(String folder) {
        this.folder = folder;
    }
}
