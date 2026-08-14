package com.veterinaria.backend.appointment.service.Impl;

import com.veterinaria.backend.appointment.dto.AppointmentDTO;
import com.veterinaria.backend.appointment.dto.CreateAppointmentDTO;
import com.veterinaria.backend.appointment.dto.UpdateAppointmentDTO;
import com.veterinaria.backend.appointment.mapper.AppointmentMapper;
import com.veterinaria.backend.appointment.model.Appointment;
import com.veterinaria.backend.appointment.repository.AppointmentRepository;
import com.veterinaria.backend.appointment.service.AppointmentService;
import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.grooming.model.GroomingStaff;
import com.veterinaria.backend.grooming.repository.GroomingStaffRepository;
import com.veterinaria.backend.schedule.model.GroomingSchedule;
import com.veterinaria.backend.schedule.model.VeterinarianSchedule;
import com.veterinaria.backend.schedule.repository.GroomingScheduleRepository;
import com.veterinaria.backend.schedule.repository.VeterinarianScheduleRepository;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.pet.repository.PetRepository;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import com.veterinaria.backend.veterinarian.repository.VeterinarianRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private static final Set<String> VALID_STATUSES = Set.of("pendiente", "confirmada", "completada", "cancelada");
    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    // Transiciones de estado permitidas (incluye la identidad para permitir guardar sin cambiar de estado)
    private static final Map<String, Set<String>> VALID_TRANSITIONS = Map.of(
            "pendiente", Set.of("pendiente", "confirmada", "cancelada"),
            "confirmada", Set.of("confirmada", "completada", "cancelada"),
            "completada", Set.of("completada"),
            "cancelada", Set.of("cancelada")
    );

    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final GroomingStaffRepository groomingStaffRepository;
    private final VeterinarianScheduleRepository veterinarianScheduleRepository;
    private final GroomingScheduleRepository groomingScheduleRepository;
    private final AppointmentMapper appointmentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAllAppointments(LocalDate date, LocalDate from, LocalDate to, UUID veterinarianId, UUID petId, String status) {
        return appointmentRepository.findAll(buildSpecification(date, from, to, veterinarianId, petId, status)).stream()
                .map(appointmentMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAllAppointmentsPaginated(LocalDate date, LocalDate from, LocalDate to, UUID veterinarianId, UUID petId, String status, Pageable pageable) {
        return appointmentRepository.findAll(buildSpecification(date, from, to, veterinarianId, petId, status), pageable)
                .map(appointmentMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentDTO getAppointmentById(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cita no encontrada"));
        return appointmentMapper.toDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentDTO createAppointment(CreateAppointmentDTO dto) {
        validateSchedule(dto.getDate(), dto.getStartTime(), dto.getEndTime());

        Pet pet = findActivePet(dto.getPetId());

        Veterinarian veterinarian = findActiveVeterinarian(dto.getVeterinarianId());
        GroomingStaff groomingStaff = findActiveGroomingStaff(dto.getGroomingStaffId());
        validateSingleProfessional(veterinarian, groomingStaff);
        validateProfessionalAvailability(veterinarian, groomingStaff, dto.getDate(), dto.getStartTime(), dto.getEndTime());

        if (veterinarian != null) {
            validateNoOverlap(veterinarian.getId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), null);
        }
        if (groomingStaff != null) {
            validateNoGroomingOverlap(groomingStaff.getId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), null);
        }

        Appointment appointment = Appointment.builder()
                .pet(pet)
                .veterinarian(veterinarian)
                .groomingStaff(groomingStaff)
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .serviceType(dto.getServiceType().trim())
                .notes(trimToNull(dto.getNotes()))
                .build();

        Appointment saved = appointmentRepository.saveAndFlush(appointment);
        log.info("Appointment created: {} on {} {}", saved.getId(), saved.getDate(), saved.getStartTime());
        return appointmentMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public AppointmentDTO updateAppointment(UUID id, UpdateAppointmentDTO dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cita no encontrada"));

        validateSchedule(dto.getDate(), dto.getStartTime(), dto.getEndTime());

        String status = dto.getStatus().trim().toLowerCase();
        if (!VALID_STATUSES.contains(status)) {
            throw new BusinessException("Estado inválido: " + dto.getStatus() + ". Valores permitidos: " + String.join(", ", VALID_STATUSES));
        }
        Set<String> allowedNext = VALID_TRANSITIONS.get(appointment.getStatus());
        if (allowedNext == null || !allowedNext.contains(status)) {
            throw new BusinessException("No se puede cambiar el estado de la cita de '" + appointment.getStatus() + "' a '" + status + "'");
        }

        Pet pet = findActivePet(dto.getPetId());

        Veterinarian veterinarian = findActiveVeterinarian(dto.getVeterinarianId());
        GroomingStaff groomingStaff = findActiveGroomingStaff(dto.getGroomingStaffId());
        validateSingleProfessional(veterinarian, groomingStaff);

        // Las citas canceladas no requieren disponibilidad del profesional
        if (!"cancelada".equals(status)) {
            validateProfessionalAvailability(veterinarian, groomingStaff, dto.getDate(), dto.getStartTime(), dto.getEndTime());
        }

        if (veterinarian != null && !"cancelada".equals(status)) {
            validateNoOverlap(veterinarian.getId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), appointment.getId());
        }
        if (groomingStaff != null && !"cancelada".equals(status)) {
            validateNoGroomingOverlap(groomingStaff.getId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), appointment.getId());
        }

        appointment.setPet(pet);
        appointment.setVeterinarian(veterinarian);
        appointment.setGroomingStaff(groomingStaff);
        appointment.setDate(dto.getDate());
        appointment.setStartTime(dto.getStartTime());
        appointment.setEndTime(dto.getEndTime());
        appointment.setServiceType(dto.getServiceType().trim());
        appointment.setStatus(status);
        appointment.setNotes(trimToNull(dto.getNotes()));

        Appointment updated = appointmentRepository.saveAndFlush(appointment);
        log.info("Appointment updated: {} (status: {})", updated.getId(), updated.getStatus());
        return appointmentMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void cancelAppointment(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cita no encontrada"));

        if ("cancelada".equalsIgnoreCase(appointment.getStatus())) {
            throw new BusinessException("La cita ya está cancelada");
        }

        appointment.setStatus("cancelada");
        appointmentRepository.saveAndFlush(appointment);
        log.info("Appointment cancelled: {}", id);
    }

    private Specification<Appointment> buildSpecification(LocalDate date, LocalDate from, LocalDate to, UUID veterinarianId, UUID petId, String status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (date != null) {
                predicates.add(cb.equal(root.get("date"), date));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("date"), to));
            }
            if (veterinarianId != null) {
                predicates.add(cb.equal(root.get("veterinarian").get("id"), veterinarianId));
            }
            if (petId != null) {
                predicates.add(cb.equal(root.get("pet").get("id"), petId));
            }
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status.trim().toLowerCase()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void validateSchedule(LocalDate date, LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new BusinessException("La hora de inicio debe ser anterior a la hora de fin");
        }
    }

    private void validateProfessionalAvailability(Veterinarian veterinarian, GroomingStaff groomingStaff,
                                                  LocalDate date, LocalTime startTime, LocalTime endTime) {
        // java DayOfWeek: MONDAY=1..SUNDAY=7 → convertir a 0=Domingo..6=Sábado
        int dayOfWeek = date.getDayOfWeek().getValue() % 7;
        if (veterinarian != null) {
            VeterinarianSchedule schedule = veterinarianScheduleRepository
                    .findByVeterinarianIdAndDayOfWeekAndIsActiveTrue(veterinarian.getId(), dayOfWeek)
                    .orElseThrow(() -> new BusinessException(
                            "El veterinario no tiene un horario registrado para ese día de la semana"));
            validateWithinSchedule(schedule.getIsAvailable(), schedule.getStartTime(), schedule.getEndTime(),
                    startTime, endTime, "veterinario");
        }
        if (groomingStaff != null) {
            GroomingSchedule schedule = groomingScheduleRepository
                    .findByGroomingStaffIdAndDayOfWeekAndIsActiveTrue(groomingStaff.getId(), dayOfWeek)
                    .orElseThrow(() -> new BusinessException(
                            "El personal de grooming no tiene un horario registrado para ese día de la semana"));
            validateWithinSchedule(schedule.getIsAvailable(), schedule.getStartTime(), schedule.getEndTime(),
                    startTime, endTime, "personal de grooming");
        }
    }

    private void validateWithinSchedule(Boolean isAvailable, LocalTime scheduleStart, LocalTime scheduleEnd,
                                        LocalTime startTime, LocalTime endTime, String professionalLabel) {
        if (!Boolean.TRUE.equals(isAvailable)) {
            throw new BusinessException("El " + professionalLabel + " no está disponible ese día de la semana");
        }
        if (startTime.isBefore(scheduleStart) || endTime.isAfter(scheduleEnd)) {
            throw new BusinessException(String.format(
                    "La cita debe estar dentro del horario de atención del %s (%s–%s)",
                    professionalLabel, HH_MM.format(scheduleStart), HH_MM.format(scheduleEnd)));
        }
    }

    private Pet findActivePet(UUID petId) {
        Pet pet = petRepository.findById(petId)
                .filter(p -> "activo".equalsIgnoreCase(p.getStatus()))
                .orElseThrow(() -> new NotFoundException("La mascota especificada no existe"));
        if (pet.getOwner() == null || !Boolean.TRUE.equals(pet.getOwner().getIsActive())) {
            throw new BusinessException("No se puede agendar una cita para una mascota cuyo dueño está inactivo");
        }
        return pet;
    }

    private Veterinarian findActiveVeterinarian(UUID veterinarianId) {
        if (veterinarianId == null) {
            return null;
        }
        return veterinarianRepository.findById(veterinarianId)
                .filter(v -> "activo".equalsIgnoreCase(v.getStatus()))
                .orElseThrow(() -> new NotFoundException("El veterinario especificado no existe"));
    }

    private GroomingStaff findActiveGroomingStaff(UUID groomingStaffId) {
        if (groomingStaffId == null) {
            return null;
        }
        return groomingStaffRepository.findById(groomingStaffId)
                .filter(g -> "activo".equalsIgnoreCase(g.getStatus()))
                .orElseThrow(() -> new NotFoundException("El personal de grooming especificado no existe"));
    }

    private void validateSingleProfessional(Veterinarian veterinarian, GroomingStaff groomingStaff) {
        if (veterinarian != null && groomingStaff != null) {
            throw new BusinessException("Una cita no puede tener veterinario y personal de grooming a la vez");
        }
    }

    private void validateNoOverlap(UUID veterinarianId, LocalDate date, LocalTime startTime, LocalTime endTime, UUID excludeId) {
        long overlaps = appointmentRepository.countOverlappingForVeterinarian(
                veterinarianId, date, startTime, endTime,
                excludeId != null ? excludeId : UUID.fromString("00000000-0000-0000-0000-000000000000"));
        if (overlaps > 0) {
            throw new ConflictException("El veterinario ya tiene una cita en ese horario");
        }
    }

    private void validateNoGroomingOverlap(UUID groomingStaffId, LocalDate date, LocalTime startTime, LocalTime endTime, UUID excludeId) {
        long overlaps = appointmentRepository.countOverlappingForGroomingStaff(
                groomingStaffId, date, startTime, endTime,
                excludeId != null ? excludeId : UUID.fromString("00000000-0000-0000-0000-000000000000"));
        if (overlaps > 0) {
            throw new ConflictException("El personal de grooming ya tiene una cita en ese horario");
        }
    }

    private String trimToNull(String value) {
        return value != null && !value.trim().isEmpty() ? value.trim() : null;
    }
}
