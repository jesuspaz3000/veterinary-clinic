package com.veterinaria.backend.hospitalization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class UpdateHospitalizationRecordDTO {

    @NotNull(message = "La mascota es obligatoria")
    private UUID petId;

    @NotNull(message = "El registro médico asociado es obligatorio")
    private UUID medicalRecordId;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    private Instant admissionDate;

    private Instant dischargeDate;

    @NotBlank(message = "El motivo de hospitalización es obligatorio")
    private String reason;

    @Size(max = 50, message = "El número de jaula no puede exceder los 50 caracteres")
    private String cageNumber;

    @NotNull(message = "El veterinario responsable es obligatorio")
    private UUID veterinarianId;

    @NotBlank(message = "El estado es obligatorio")
    private String status; // activo, alta, transferido

    @Size(max = 2000, message = "El diagnóstico final no puede exceder los 2000 caracteres")
    private String finalDiagnosis;

    @Size(max = 2000, message = "Las notas de alta no pueden exceder los 2000 caracteres")
    private String dischargeNotes;
}
