package com.veterinaria.backend.surgery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class CreateSurgeryRecordDTO {

    @NotNull(message = "La mascota es obligatoria")
    private UUID petId;

    @NotNull(message = "El registro médico asociado es obligatorio")
    private UUID medicalRecordId;

    @NotBlank(message = "El tipo de cirugía es obligatorio")
    private String surgeryType; // esterilizacion, trauma, tumor

    @NotNull(message = "La fecha de la cirugía es obligatoria")
    private Instant surgeryDate;

    @NotNull(message = "El cirujano principal es obligatorio")
    private UUID veterinarianId;

    private UUID assistantVeterinarianId;

    @Size(max = 100, message = "El tipo de anestesia no puede exceder los 100 caracteres")
    private String anesthesiaType;

    @Positive(message = "La duración debe ser mayor a 0 minutos")
    private Integer durationMinutes;

    @Size(max = 2000, message = "Las notas prequirúrgicas no pueden exceder los 2000 caracteres")
    private String preSurgeryNotes;

    @Size(max = 2000, message = "Las notas de la cirugía no pueden exceder los 2000 caracteres")
    private String surgeryNotes;

    @Size(max = 2000, message = "Las notas postquirúrgicas no pueden exceder los 2000 caracteres")
    private String postSurgeryNotes;

    @Size(max = 2000, message = "Las complicaciones no pueden exceder los 2000 caracteres")
    private String complications;

    private String status; // opcional en creación: por defecto "programada"
}
