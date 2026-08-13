package com.veterinaria.backend.appointment.mapper;

import com.veterinaria.backend.appointment.dto.AppointmentDTO;
import com.veterinaria.backend.appointment.model.Appointment;
import com.veterinaria.backend.grooming.mapper.GroomingStaffMapper;
import com.veterinaria.backend.pet.mapper.PetMapper;
import com.veterinaria.backend.veterinarian.mapper.VeterinarianMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AppointmentMapper {

    private final PetMapper petMapper;
    private final VeterinarianMapper veterinarianMapper;
    private final GroomingStaffMapper groomingStaffMapper;

    public AppointmentDTO toDTO(Appointment appointment) {
        if (appointment == null) return null;

        return AppointmentDTO.builder()
                .id(appointment.getId())
                .pet(petMapper.toDTO(appointment.getPet()))
                .veterinarian(veterinarianMapper.toDTO(appointment.getVeterinarian()))
                .groomingStaff(groomingStaffMapper.toDTO(appointment.getGroomingStaff()))
                .date(appointment.getDate())
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .serviceType(appointment.getServiceType())
                .status(appointment.getStatus())
                .notes(appointment.getNotes())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }
}
