package com.veterinaria.backend.pet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetPhotoDTO {

    private UUID id;
    /** URL pública resuelta de la foto */
    private String photoUrl;
    private String description;
    private Instant uploadedAt;
}
