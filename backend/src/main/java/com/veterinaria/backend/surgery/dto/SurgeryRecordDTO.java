package com.veterinaria.backend.surgery.dto;

import com.veterinaria.backend.pet.dto.PetDTO;
import com.veterinaria.backend.veterinarian.dto.VeterinarianDTO;
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
public class SurgeryRecordDTO {
    private UUID id;
    private PetDTO pet;
    private UUID medicalRecordId;
    private String surgeryType;
    private Instant surgeryDate;
    private VeterinarianDTO veterinarian;
    private VeterinarianDTO assistantVeterinarian;
    private String anesthesiaType;
    private Integer durationMinutes;
    private String preSurgeryNotes;
    private String surgeryNotes;
    private String postSurgeryNotes;
    private String complications;
    private String status;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
