package com.veterinaria.backend.appointment.dto;

import com.veterinaria.backend.grooming.dto.GroomingStaffDTO;
import com.veterinaria.backend.pet.dto.PetDTO;
import com.veterinaria.backend.veterinarian.dto.VeterinarianDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDTO {
    private UUID id;
    private PetDTO pet;
    private VeterinarianDTO veterinarian;
    private GroomingStaffDTO groomingStaff;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String serviceType;
    private String status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
