package com.veterinaria.backend.vaccination.dto;

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
public class UpdateVaccinationRecordDTO {

    @NotNull(message = "La mascota es obligatoria")
    private UUID petId;

    private UUID medicalRecordId;

    @NotNull(message = "El producto/vacuna es obligatorio")
    private UUID productId;

    @NotNull(message = "El veterinario es obligatorio")
    private UUID veterinarianId;

    @Size(max = 100, message = "El número de lote no puede exceder los 100 caracteres")
    private String batchNumber;

    @NotNull(message = "La fecha de aplicación es obligatoria")
    private LocalDate applicationDate;

    private LocalDate nextDoseDate;

    @Size(max = 1000, message = "Las observaciones no pueden exceder los 1000 caracteres")
    private String observations;
}
