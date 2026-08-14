package com.veterinaria.backend.hospitalization.dto;

import com.veterinaria.backend.pet.dto.PetDTO;
import com.veterinaria.backend.veterinarian.dto.VeterinarianDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalizationRecordDTO {
    private UUID id;
    private PetDTO pet;
    private UUID medicalRecordId;
    private Instant admissionDate;
    private Instant dischargeDate;
    private String reason;
    private String cageNumber;
    private VeterinarianDTO veterinarian;
    private String status;
    private String finalDiagnosis;
    private String dischargeNotes;
    private List<HospitalizationEvolutionDTO> evolutions;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
