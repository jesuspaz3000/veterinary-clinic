package com.veterinaria.backend.surgery.service.Impl;

import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.medicalrecord.model.MedicalRecord;
import com.veterinaria.backend.medicalrecord.repository.MedicalRecordRepository;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.pet.repository.PetRepository;
import com.veterinaria.backend.surgery.dto.CreateSurgeryRecordDTO;
import com.veterinaria.backend.surgery.dto.SurgeryRecordDTO;
import com.veterinaria.backend.surgery.dto.UpdateSurgeryRecordDTO;
import com.veterinaria.backend.surgery.mapper.SurgeryRecordMapper;
import com.veterinaria.backend.surgery.model.SurgeryRecord;
import com.veterinaria.backend.surgery.repository.SurgeryRecordRepository;
import com.veterinaria.backend.surgery.service.SurgeryRecordService;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import com.veterinaria.backend.veterinarian.repository.VeterinarianRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SurgeryRecordServiceImpl implements SurgeryRecordService {

    private static final Set<String> SURGERY_TYPES = Set.of("esterilizacion", "trauma", "tumor");
    private static final Set<String> STATUSES = Set.of("programada", "en_proceso", "completada", "cancelada");
    // Duración asumida para el choque de horario cuando no se especifica una duración
    private static final int DEFAULT_DURATION_MINUTES = 60;

    // Transiciones de estado permitidas (incluye la identidad para permitir guardar sin cambiar de estado)
    private static final Map<String, Set<String>> VALID_TRANSITIONS = Map.of(
            "programada", Set.of("programada", "en_proceso", "cancelada"),
            "en_proceso", Set.of("en_proceso", "completada", "cancelada"),
            "completada", Set.of("completada"),
            "cancelada", Set.of("cancelada")
    );

    private final SurgeryRecordRepository surgeryRecordRepository;
    private final PetRepository petRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final SurgeryRecordMapper surgeryRecordMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<SurgeryRecordDTO> getAllSurgeryRecordsPaginated(UUID petId, UUID veterinarianId, String surgeryType,
            String status, Instant from, Instant to, String activeStatus, Pageable pageable) {
        return surgeryRecordRepository.findAll(
                        buildSpecification(petId, veterinarianId, surgeryType, status, from, to, activeStatus), pageable)
                .map(surgeryRecordMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public SurgeryRecordDTO getSurgeryRecordById(UUID id) {
        return surgeryRecordMapper.toDTO(findRecord(id));
    }

    @Override
    @Transactional
    public SurgeryRecordDTO createSurgeryRecord(CreateSurgeryRecordDTO dto) {
        if (dto.getSurgeryDate().isBefore(Instant.now())) {
            throw new BusinessException("La fecha de la cirugía no puede ser en el pasado");
        }

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        MedicalRecord medicalRecord = resolveMedicalRecord(dto.getMedicalRecordId(), pet);
        Veterinarian veterinarian = findActiveVeterinarian(dto.getVeterinarianId(), "El cirujano principal");
        Veterinarian assistant = resolveAssistant(dto.getAssistantVeterinarianId(), veterinarian);
        String surgeryType = validateSurgeryType(dto.getSurgeryType());
        // Una cirugía nueva siempre empieza programada; el estado solo avanza vía edición
        String status = "programada";

        Instant end = dto.getSurgeryDate().plus(Duration.ofMinutes(
                dto.getDurationMinutes() != null ? dto.getDurationMinutes() : DEFAULT_DURATION_MINUTES));
        validateNoSurgeryOverlap(veterinarian.getId(), dto.getSurgeryDate(), end, null);
        if (assistant != null) {
            validateNoSurgeryOverlap(assistant.getId(), dto.getSurgeryDate(), end, null);
        }

        SurgeryRecord record = SurgeryRecord.builder()
                .pet(pet)
                .medicalRecord(medicalRecord)
                .surgeryType(surgeryType)
                .surgeryDate(dto.getSurgeryDate())
                .veterinarian(veterinarian)
                .assistantVeterinarian(assistant)
                .anesthesiaType(trimToNull(dto.getAnesthesiaType()))
                .durationMinutes(dto.getDurationMinutes())
                .preSurgeryNotes(trimToNull(dto.getPreSurgeryNotes()))
                .surgeryNotes(trimToNull(dto.getSurgeryNotes()))
                .postSurgeryNotes(trimToNull(dto.getPostSurgeryNotes()))
                .complications(trimToNull(dto.getComplications()))
                .status(status)
                .build();

        return surgeryRecordMapper.toDTO(surgeryRecordRepository.saveAndFlush(record));
    }

    @Override
    @Transactional
    public SurgeryRecordDTO updateSurgeryRecord(UUID id, UpdateSurgeryRecordDTO dto) {
        SurgeryRecord record = findRecord(id);

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        MedicalRecord medicalRecord = resolveMedicalRecord(dto.getMedicalRecordId(), pet);
        Veterinarian veterinarian = findActiveVeterinarian(dto.getVeterinarianId(), "El cirujano principal");
        Veterinarian assistant = resolveAssistant(dto.getAssistantVeterinarianId(), veterinarian);
        String surgeryType = validateSurgeryType(dto.getSurgeryType());
        String status = validateStatus(dto.getStatus());
        Set<String> allowedNext = VALID_TRANSITIONS.get(record.getStatus());
        if (allowedNext == null || !allowedNext.contains(status)) {
            throw new BusinessException("No se puede cambiar el estado de la cirugía de '" + record.getStatus() + "' a '" + status + "'");
        }

        // Solo se valida choque de horario si la cirugía sigue ocupando una franja
        // (programada/en_proceso); una ya completada o cancelada no bloquea nada
        if ("programada".equals(status) || "en_proceso".equals(status)) {
            Instant end = dto.getSurgeryDate().plus(Duration.ofMinutes(
                    dto.getDurationMinutes() != null ? dto.getDurationMinutes() : DEFAULT_DURATION_MINUTES));
            validateNoSurgeryOverlap(veterinarian.getId(), dto.getSurgeryDate(), end, record.getId());
            if (assistant != null) {
                validateNoSurgeryOverlap(assistant.getId(), dto.getSurgeryDate(), end, record.getId());
            }
        }

        record.setPet(pet);
        record.setMedicalRecord(medicalRecord);
        record.setSurgeryType(surgeryType);
        record.setSurgeryDate(dto.getSurgeryDate());
        record.setVeterinarian(veterinarian);
        record.setAssistantVeterinarian(assistant);
        record.setAnesthesiaType(trimToNull(dto.getAnesthesiaType()));
        record.setDurationMinutes(dto.getDurationMinutes());
        record.setPreSurgeryNotes(trimToNull(dto.getPreSurgeryNotes()));
        record.setSurgeryNotes(trimToNull(dto.getSurgeryNotes()));
        record.setPostSurgeryNotes(trimToNull(dto.getPostSurgeryNotes()));
        record.setComplications(trimToNull(dto.getComplications()));
        record.setStatus(status);

        return surgeryRecordMapper.toDTO(surgeryRecordRepository.saveAndFlush(record));
    }

    @Override
    @Transactional
    public void deleteSurgeryRecord(UUID id) {
        SurgeryRecord record = findRecord(id);
        record.setIsActive(false);
        surgeryRecordRepository.saveAndFlush(record);
    }

    @Override
    @Transactional
    public void reactivateSurgeryRecord(UUID id) {
        SurgeryRecord record = surgeryRecordRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Registro de cirugía no encontrado"));
        record.setIsActive(true);
        surgeryRecordRepository.saveAndFlush(record);
    }

    ////////////////////////////////////////////////////////////////
    // Privados
    ////////////////////////////////////////////////////////////////

    private SurgeryRecord findRecord(UUID id) {
        return surgeryRecordRepository.findById(id)
                .filter(SurgeryRecord::getIsActive)
                .orElseThrow(() -> new NotFoundException("Registro de cirugía no encontrado"));
    }

    private MedicalRecord resolveMedicalRecord(UUID medicalRecordId, Pet pet) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(() -> new NotFoundException("Registro médico no encontrado"));
        if (!medicalRecord.getPet().getId().equals(pet.getId())) {
            throw new BusinessException("El registro médico seleccionado no corresponde a la mascota indicada");
        }
        return medicalRecord;
    }

    private Veterinarian resolveAssistant(UUID assistantVeterinarianId, Veterinarian primarySurgeon) {
        if (assistantVeterinarianId == null) return null;
        if (assistantVeterinarianId.equals(primarySurgeon.getId())) {
            throw new BusinessException("El veterinario asistente debe ser distinto al cirujano principal");
        }
        return findActiveVeterinarian(assistantVeterinarianId, "El veterinario asistente");
    }

    private Veterinarian findActiveVeterinarian(UUID veterinarianId, String label) {
        return veterinarianRepository.findById(veterinarianId)
                .filter(v -> "activo".equalsIgnoreCase(v.getStatus()))
                .orElseThrow(() -> new NotFoundException(label + " no existe o está inactivo"));
    }

    private void validateNoSurgeryOverlap(UUID veterinarianId, Instant start, Instant end, UUID excludeId) {
        boolean hasOverlap = surgeryRecordRepository.findActiveNonTerminalByVeterinarianOrAssistant(veterinarianId).stream()
                .filter(s -> excludeId == null || !s.getId().equals(excludeId))
                .anyMatch(s -> {
                    Instant existingStart = s.getSurgeryDate();
                    Instant existingEnd = existingStart.plus(Duration.ofMinutes(
                            s.getDurationMinutes() != null ? s.getDurationMinutes() : DEFAULT_DURATION_MINUTES));
                    return start.isBefore(existingEnd) && existingStart.isBefore(end);
                });
        if (hasOverlap) {
            throw new ConflictException("El veterinario ya tiene otra cirugía programada en ese horario");
        }
    }

    private String validateSurgeryType(String surgeryType) {
        String normalized = surgeryType == null ? "" : surgeryType.trim().toLowerCase();
        if (!SURGERY_TYPES.contains(normalized)) {
            throw new BusinessException("Tipo de cirugía inválido. Valores permitidos: " + String.join(", ", SURGERY_TYPES));
        }
        return normalized;
    }

    private String validateStatus(String status) {
        String normalized = status == null ? "" : status.trim().toLowerCase();
        if (!STATUSES.contains(normalized)) {
            throw new BusinessException("Estado inválido. Valores permitidos: " + String.join(", ", STATUSES));
        }
        return normalized;
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Specification<SurgeryRecord> buildSpecification(UUID petId, UUID veterinarianId, String surgeryType,
            String status, Instant from, Instant to, String activeStatus) {
        Specification<SurgeryRecord> spec = (root, query, cb) -> cb.conjunction();

        if (activeStatus == null || activeStatus.isBlank()) {
            // Por defecto solo se listan registros activos
            spec = spec.and((root, query, cb) -> cb.isTrue(root.get("isActive")));
        } else if ("inactivo".equalsIgnoreCase(activeStatus.trim())) {
            spec = spec.and((root, query, cb) -> cb.isFalse(root.get("isActive")));
        } else if (!"todos".equalsIgnoreCase(activeStatus.trim())) {
            spec = spec.and((root, query, cb) -> cb.isTrue(root.get("isActive")));
        }
        // activeStatus == "todos": sin filtro de eliminación lógica, se listan todos

        if (petId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("pet").get("id"), petId));
        }
        if (veterinarianId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("veterinarian").get("id"), veterinarianId));
        }
        if (surgeryType != null && !surgeryType.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("surgeryType"), surgeryType.trim().toLowerCase()));
        }
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status.trim().toLowerCase()));
        }
        if (from != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("surgeryDate"), from));
        }
        if (to != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("surgeryDate"), to));
        }
        return spec;
    }
}
