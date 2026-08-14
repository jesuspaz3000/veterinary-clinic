package com.veterinaria.backend.schedule.mapper;

import com.veterinaria.backend.schedule.dto.ScheduleDTO;
import com.veterinaria.backend.schedule.model.GroomingSchedule;
import com.veterinaria.backend.schedule.model.VeterinarianSchedule;
import org.springframework.stereotype.Component;

@Component
public class ScheduleMapper {

    public ScheduleDTO toDTO(VeterinarianSchedule schedule) {
        if (schedule == null) return null;

        return ScheduleDTO.builder()
                .id(schedule.getId())
                .dayOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .isAvailable(schedule.getIsAvailable())
                .isActive(schedule.getIsActive())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }

    public ScheduleDTO toDTO(GroomingSchedule schedule) {
        if (schedule == null) return null;

        return ScheduleDTO.builder()
                .id(schedule.getId())
                .dayOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .isAvailable(schedule.getIsAvailable())
                .isActive(schedule.getIsActive())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }
}
