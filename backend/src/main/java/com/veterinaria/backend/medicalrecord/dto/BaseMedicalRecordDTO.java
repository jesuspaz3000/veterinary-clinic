package com.veterinaria.backend.medicalrecord.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Campos compartidos entre creación y edición de un registro médico */
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class BaseMedicalRecordDTO {

    @NotNull(message = "La mascota es obligatoria")
    private UUID petId;

    @NotNull(message = "El veterinario es obligatorio")
    private UUID veterinarianId;

    private UUID appointmentId;

    @NotBlank(message = "El tipo de registro es obligatorio")
    private String recordType;

    @NotNull(message = "La fecha del registro es obligatoria")
    private Instant recordDate;

    private String reason;
    private String symptoms;
    private String diagnosis;
    private String treatment;
    private String observations;

    private BigDecimal weight;
    private BigDecimal temperature;
    private Integer heartRate;
    private Integer respiratoryRate;

    private LocalDate followUpDate;

    private String status;

    @Valid
    private List<PrescriptionItemDTO> prescriptions;
}
