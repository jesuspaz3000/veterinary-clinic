package com.veterinaria.backend.surgery.service.Impl;

import com.veterinaria.backend.common.exception.BusinessException;
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

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SurgeryRecordServiceImpl implements SurgeryRecordService {

    private static final Set<String> SURGERY_TYPES = Set.of("esterilizacion", "trauma", "tumor");
    private static final Set<String> STATUSES = Set.of("programada", "en_proceso", "completada", "cancelada");

    private final SurgeryRecordRepository surgeryRecordRepository;
    private final PetRepository petRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final SurgeryRecordMapper surgeryRecordMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<SurgeryRecordDTO> getAllSurgeryRecordsPaginated(UUID petId, UUID veterinarianId, String surgeryType,
            String status, Instant from, Instant to, Pageable pageable) {
        return surgeryRecordRepository.findAll(
                        buildSpecification(petId, veterinarianId, surgeryType, status, from, to), pageable)
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
        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        MedicalRecord medicalRecord = resolveMedicalRecord(dto.getMedicalRecordId(), pet);
        Veterinarian veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Cirujano principal no encontrado"));
        Veterinarian assistant = resolveAssistant(dto.getAssistantVeterinarianId(), veterinarian);
        String surgeryType = validateSurgeryType(dto.getSurgeryType());
        String status = validateStatus(dto.getStatus() != null && !dto.getStatus().isBlank() ? dto.getStatus() : "programada");

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
        Veterinarian veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Cirujano principal no encontrado"));
        Veterinarian assistant = resolveAssistant(dto.getAssistantVeterinarianId(), veterinarian);
        String surgeryType = validateSurgeryType(dto.getSurgeryType());
        String status = validateStatus(dto.getStatus());

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
        surgeryRecordRepository.delete(findRecord(id));
    }

    ////////////////////////////////////////////////////////////////
    // Privados
    ////////////////////////////////////////////////////////////////

    private SurgeryRecord findRecord(UUID id) {
        return surgeryRecordRepository.findById(id)
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
        return veterinarianRepository.findById(assistantVeterinarianId)
                .orElseThrow(() -> new NotFoundException("Veterinario asistente no encontrado"));
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
            String status, Instant from, Instant to) {
        Specification<SurgeryRecord> spec = (root, query, cb) -> cb.conjunction();
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
