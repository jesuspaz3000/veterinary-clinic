package com.veterinaria.backend.schedule.service;

import com.veterinaria.backend.schedule.dto.ScheduleDTO;
import com.veterinaria.backend.schedule.dto.ScheduleRequestDTO;

import java.util.List;
import java.util.UUID;

public interface ScheduleService {

    List<ScheduleDTO> getVeterinarianSchedules(UUID veterinarianId, String status);

    List<ScheduleDTO> getGroomingSchedules(UUID groomingStaffId, String status);

    ScheduleDTO createVeterinarianSchedule(UUID veterinarianId, ScheduleRequestDTO dto);

    ScheduleDTO createGroomingSchedule(UUID groomingStaffId, ScheduleRequestDTO dto);

    ScheduleDTO updateVeterinarianSchedule(UUID scheduleId, ScheduleRequestDTO dto);

    ScheduleDTO updateGroomingSchedule(UUID scheduleId, ScheduleRequestDTO dto);

    void deleteVeterinarianSchedule(UUID scheduleId);

    void deleteGroomingSchedule(UUID scheduleId);

    void reactivateVeterinarianSchedule(UUID scheduleId);

    void reactivateGroomingSchedule(UUID scheduleId);
}
