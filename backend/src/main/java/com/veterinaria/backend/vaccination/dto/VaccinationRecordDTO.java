package com.veterinaria.backend.vaccination.dto;

import com.veterinaria.backend.pet.dto.PetDTO;
import com.veterinaria.backend.veterinarian.dto.VeterinarianDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationRecordDTO {
    private UUID id;
    private PetDTO pet;
    private UUID medicalRecordId;
    private UUID productId;
    private String productName;
    private UUID productVariantId;
    private String productVariantName;
    private VeterinarianDTO veterinarian;
    private String vaccineName;
    private String vaccineBrand;
    private String batchNumber;
    private LocalDate applicationDate;
    private LocalDate nextDoseDate;
    private String observations;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
