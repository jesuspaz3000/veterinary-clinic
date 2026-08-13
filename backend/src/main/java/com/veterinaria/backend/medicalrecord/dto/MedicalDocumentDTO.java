package com.veterinaria.backend.medicalrecord.dto;

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
public class MedicalDocumentDTO {

    private UUID id;
    private String documentType;
    /** URL pública resuelta del archivo */
    private String documentUrl;
    private String fileName;
    private String description;
    private Instant uploadedAt;
}
