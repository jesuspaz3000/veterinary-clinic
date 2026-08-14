package com.veterinaria.backend.schedule.service.Impl;

import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.grooming.model.GroomingStaff;
import com.veterinaria.backend.grooming.repository.GroomingStaffRepository;
import com.veterinaria.backend.schedule.dto.ScheduleDTO;
import com.veterinaria.backend.schedule.dto.ScheduleRequestDTO;
import com.veterinaria.backend.schedule.mapper.ScheduleMapper;
import com.veterinaria.backend.schedule.model.GroomingSchedule;
import com.veterinaria.backend.schedule.model.VeterinarianSchedule;
import com.veterinaria.backend.schedule.repository.GroomingScheduleRepository;
import com.veterinaria.backend.schedule.repository.VeterinarianScheduleRepository;
import com.veterinaria.backend.schedule.service.ScheduleService;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import com.veterinaria.backend.veterinarian.repository.VeterinarianRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final VeterinarianScheduleRepository veterinarianScheduleRepository;
    private final GroomingScheduleRepository groomingScheduleRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final GroomingStaffRepository groomingStaffRepository;
    private final ScheduleMapper scheduleMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleDTO> getVeterinarianSchedules(UUID veterinarianId, String status) {
        List<VeterinarianSchedule> schedules;
        if (status == null || status.isBlank() || "activo".equalsIgnoreCase(status.trim())) {
            schedules = veterinarianScheduleRepository.findByVeterinarianIdAndIsActiveTrueOrderByDayOfWeekAsc(veterinarianId);
        } else if ("inactivo".equalsIgnoreCase(status.trim())) {
            schedules = veterinarianScheduleRepository.findByVeterinarianIdAndIsActiveFalseOrderByDayOfWeekAsc(veterinarianId);
        } else {
            schedules = veterinarianScheduleRepository.findByVeterinarianIdOrderByDayOfWeekAsc(veterinarianId);
        }
        return schedules.stream().map(scheduleMapper::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleDTO> getGroomingSchedules(UUID groomingStaffId, String status) {
        List<GroomingSchedule> schedules;
        if (status == null || status.isBlank() || "activo".equalsIgnoreCase(status.trim())) {
            schedules = groomingScheduleRepository.findByGroomingStaffIdAndIsActiveTrueOrderByDayOfWeekAsc(groomingStaffId);
        } else if ("inactivo".equalsIgnoreCase(status.trim())) {
            schedules = groomingScheduleRepository.findByGroomingStaffIdAndIsActiveFalseOrderByDayOfWeekAsc(groomingStaffId);
        } else {
            schedules = groomingScheduleRepository.findByGroomingStaffIdOrderByDayOfWeekAsc(groomingStaffId);
        }
        return schedules.stream().map(scheduleMapper::toDTO).toList();
    }

    @Override
    @Transactional
    public ScheduleDTO createVeterinarianSchedule(UUID veterinarianId, ScheduleRequestDTO dto) {
        validateTimes(dto);

        Veterinarian veterinarian = findActiveVeterinarian(veterinarianId);

        if (veterinarianScheduleRepository.existsByVeterinarianIdAndDayOfWeek(veterinarianId, dto.getDayOfWeek())) {
            throw new ConflictException("El veterinario ya tiene un horario registrado para ese día");
        }

        VeterinarianSchedule schedule = VeterinarianSchedule.builder()
                .veterinarian(veterinarian)
                .dayOfWeek(dto.getDayOfWeek())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .isAvailable(dto.getIsAvailable() == null || dto.getIsAvailable())
                .build();

        VeterinarianSchedule saved = veterinarianScheduleRepository.saveAndFlush(schedule);
        log.info("Veterinarian schedule created: {} (vet: {}, day: {})", saved.getId(), veterinarianId, dto.getDayOfWeek());
        return scheduleMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ScheduleDTO createGroomingSchedule(UUID groomingStaffId, ScheduleRequestDTO dto) {
        validateTimes(dto);

        GroomingStaff groomingStaff = findActiveGroomingStaff(groomingStaffId);

        if (groomingScheduleRepository.existsByGroomingStaffIdAndDayOfWeek(groomingStaffId, dto.getDayOfWeek())) {
            throw new ConflictException("El personal de grooming ya tiene un horario registrado para ese día");
        }

        GroomingSchedule schedule = GroomingSchedule.builder()
                .groomingStaff(groomingStaff)
                .dayOfWeek(dto.getDayOfWeek())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .isAvailable(dto.getIsAvailable() == null || dto.getIsAvailable())
                .build();

        GroomingSchedule saved = groomingScheduleRepository.saveAndFlush(schedule);
        log.info("Grooming schedule created: {} (staff: {}, day: {})", saved.getId(), groomingStaffId, dto.getDayOfWeek());
        return scheduleMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ScheduleDTO updateVeterinarianSchedule(UUID scheduleId, ScheduleRequestDTO dto) {
        validateTimes(dto);

        VeterinarianSchedule schedule = findActiveVeterinarianSchedule(scheduleId);

        if (veterinarianScheduleRepository.existsByVeterinarianIdAndDayOfWeekAndIdNot(
                schedule.getVeterinarian().getId(), dto.getDayOfWeek(), scheduleId)) {
            throw new ConflictException("El veterinario ya tiene un horario registrado para ese día");
        }

        schedule.setDayOfWeek(dto.getDayOfWeek());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setIsAvailable(dto.getIsAvailable() == null || dto.getIsAvailable());

        VeterinarianSchedule updated = veterinarianScheduleRepository.saveAndFlush(schedule);
        log.info("Veterinarian schedule updated: {}", updated.getId());
        return scheduleMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public ScheduleDTO updateGroomingSchedule(UUID scheduleId, ScheduleRequestDTO dto) {
        validateTimes(dto);

        GroomingSchedule schedule = findActiveGroomingSchedule(scheduleId);

        if (groomingScheduleRepository.existsByGroomingStaffIdAndDayOfWeekAndIdNot(
                schedule.getGroomingStaff().getId(), dto.getDayOfWeek(), scheduleId)) {
            throw new ConflictException("El personal de grooming ya tiene un horario registrado para ese día");
        }

        schedule.setDayOfWeek(dto.getDayOfWeek());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setIsAvailable(dto.getIsAvailable() == null || dto.getIsAvailable());

        GroomingSchedule updated = groomingScheduleRepository.saveAndFlush(schedule);
        log.info("Grooming schedule updated: {}", updated.getId());
        return scheduleMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteVeterinarianSchedule(UUID scheduleId) {
        VeterinarianSchedule schedule = findActiveVeterinarianSchedule(scheduleId);
        schedule.setIsActive(false);
        veterinarianScheduleRepository.saveAndFlush(schedule);
        log.info("Veterinarian schedule deactivated: {}", scheduleId);
    }

    @Override
    @Transactional
    public void deleteGroomingSchedule(UUID scheduleId) {
        GroomingSchedule schedule = findActiveGroomingSchedule(scheduleId);
        schedule.setIsActive(false);
        groomingScheduleRepository.saveAndFlush(schedule);
        log.info("Grooming schedule deactivated: {}", scheduleId);
    }

    @Override
    @Transactional
    public void reactivateVeterinarianSchedule(UUID scheduleId) {
        VeterinarianSchedule schedule = veterinarianScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new NotFoundException("Horario no encontrado"));
        schedule.setIsActive(true);
        veterinarianScheduleRepository.saveAndFlush(schedule);
        log.info("Veterinarian schedule reactivated: {}", scheduleId);
    }

    @Override
    @Transactional
    public void reactivateGroomingSchedule(UUID scheduleId) {
        GroomingSchedule schedule = groomingScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new NotFoundException("Horario no encontrado"));
        schedule.setIsActive(true);
        groomingScheduleRepository.saveAndFlush(schedule);
        log.info("Grooming schedule reactivated: {}", scheduleId);
    }

    private VeterinarianSchedule findActiveVeterinarianSchedule(UUID scheduleId) {
        return veterinarianScheduleRepository.findById(scheduleId)
                .filter(VeterinarianSchedule::getIsActive)
                .orElseThrow(() -> new NotFoundException("Horario no encontrado"));
    }

    private GroomingSchedule findActiveGroomingSchedule(UUID scheduleId) {
        return groomingScheduleRepository.findById(scheduleId)
                .filter(GroomingSchedule::getIsActive)
                .orElseThrow(() -> new NotFoundException("Horario no encontrado"));
    }

    private void validateTimes(ScheduleRequestDTO dto) {
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new BusinessException("La hora de inicio debe ser anterior a la hora de fin");
        }
    }

    private Veterinarian findActiveVeterinarian(UUID veterinarianId) {
        return veterinarianRepository.findById(veterinarianId)
                .filter(v -> "activo".equalsIgnoreCase(v.getStatus()))
                .orElseThrow(() -> new NotFoundException("El veterinario especificado no existe"));
    }

    private GroomingStaff findActiveGroomingStaff(UUID groomingStaffId) {
        return groomingStaffRepository.findById(groomingStaffId)
                .filter(g -> "activo".equalsIgnoreCase(g.getStatus()))
                .orElseThrow(() -> new NotFoundException("El personal de grooming especificado no existe"));
    }
}
