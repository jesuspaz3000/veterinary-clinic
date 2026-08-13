package com.veterinaria.backend.appointment.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAppointmentDTO {

    @NotNull(message = "La mascota es obligatoria")
    private UUID petId;

    private UUID veterinarianId;

    private UUID groomingStaffId;

    @NotNull(message = "La fecha es obligatoria")
    @FutureOrPresent(message = "La fecha de la cita no puede ser en el pasado")
    private LocalDate date;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime startTime;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime endTime;

    @NotBlank(message = "El tipo de servicio es obligatorio")
    @Size(max = 100, message = "El tipo de servicio no puede exceder los 100 caracteres")
    private String serviceType;

    @Size(max = 1000, message = "Las notas no pueden exceder los 1000 caracteres")
    private String notes;
}
