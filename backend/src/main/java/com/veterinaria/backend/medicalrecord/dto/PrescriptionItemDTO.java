package com.veterinaria.backend.medicalrecord.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/** Ítem de prescripción dentro de la creación/edición de un registro médico */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemDTO {

    @NotNull(message = "El producto de la prescripción es obligatorio")
    private UUID productId;

    @NotBlank(message = "La dosis es obligatoria")
    private String dosage;

    @NotBlank(message = "La frecuencia es obligatoria")
    private String frequency;

    @NotNull(message = "La duración en días es obligatoria")
    @Positive(message = "La duración debe ser mayor a 0 días")
    private Integer durationDays;

    private String instructions;
}
