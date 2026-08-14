package com.veterinaria.backend.hospitalization.dto;

import com.veterinaria.backend.veterinarian.dto.VeterinarianDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalizationEvolutionDTO {
    private UUID id;
    private Instant evolutionDate;
    private VeterinarianDTO veterinarian;
    private BigDecimal weight;
    private BigDecimal temperature;
    private Integer heartRate;
    private Integer respiratoryRate;
    private String foodIntake;
    private String waterIntake;
    private String urination;
    private String defecation;
    private String activityLevel;
    private String medicationAdministered;
    private String proceduresPerformed;
    private String observations;
    private Instant createdAt;
}
