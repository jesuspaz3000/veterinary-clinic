package com.veterinaria.backend.hospitalization.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class CreateHospitalizationEvolutionDTO {

    @NotNull(message = "La fecha de evolución es obligatoria")
    private Instant evolutionDate;

    @NotNull(message = "El veterinario es obligatorio")
    private UUID veterinarianId;

    @DecimalMin(value = "0", message = "El peso debe ser mayor o igual a 0")
    @DecimalMax(value = "999.99", message = "El peso no puede exceder 999.99 kg")
    private BigDecimal weight;

    @DecimalMin(value = "0", message = "La temperatura debe ser mayor o igual a 0")
    @DecimalMax(value = "99.99", message = "La temperatura no puede exceder 99.99 °C")
    private BigDecimal temperature;

    private Integer heartRate;

    private Integer respiratoryRate;

    private String foodIntake; // bueno, regular, malo, no_comio

    private String waterIntake;

    private String urination; // normal, aumentada, disminuida, ausente

    private String defecation; // normal, diarrea, estreñimiento, ausente

    private String activityLevel; // activo, letargico, postrado

    @Size(max = 2000, message = "La medicación administrada no puede exceder los 2000 caracteres")
    private String medicationAdministered;

    @Size(max = 2000, message = "Los procedimientos realizados no pueden exceder los 2000 caracteres")
    private String proceduresPerformed;

    @Size(max = 2000, message = "Las observaciones no pueden exceder los 2000 caracteres")
    private String observations;
}
