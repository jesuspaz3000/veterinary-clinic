package com.veterinaria.backend.appointment.service;

import com.veterinaria.backend.appointment.dto.AppointmentDTO;
import com.veterinaria.backend.appointment.dto.CreateAppointmentDTO;
import com.veterinaria.backend.appointment.dto.UpdateAppointmentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AppointmentService {

    List<AppointmentDTO> getAllAppointments(LocalDate date, LocalDate from, LocalDate to, UUID veterinarianId, UUID petId, String status);

    Page<AppointmentDTO> getAllAppointmentsPaginated(LocalDate date, LocalDate from, LocalDate to, UUID veterinarianId, UUID petId, String status, Pageable pageable);

    AppointmentDTO getAppointmentById(UUID id);

    AppointmentDTO createAppointment(CreateAppointmentDTO dto);

    AppointmentDTO updateAppointment(UUID id, UpdateAppointmentDTO dto);

    void cancelAppointment(UUID id);
}
