package com.veterinaria.backend.deworming.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDewormingRecordDTO {

    @NotNull(message = "La mascota es obligatoria")
    private UUID petId;

    private UUID medicalRecordId;

    @NotNull(message = "El producto antiparasitario es obligatorio")
    private UUID productId;

    @NotNull(message = "La presentación/variante del producto es obligatoria")
    private UUID productVariantId;

    @NotNull(message = "El veterinario es obligatorio")
    private UUID veterinarianId;

    @NotBlank(message = "La dosis es obligatoria")
    @Size(max = 100, message = "La dosis no puede exceder los 100 caracteres")
    private String dosage;

    @NotNull(message = "La fecha de aplicación es obligatoria")
    private LocalDate applicationDate;

    private LocalDate nextApplicationDate;

    @NotBlank(message = "El tipo de desparasitación es obligatorio")
    private String dewormingType; // interna, externa, ambas

    @Size(max = 1000, message = "Las observaciones no pueden exceder los 1000 caracteres")
    private String observations;
}
