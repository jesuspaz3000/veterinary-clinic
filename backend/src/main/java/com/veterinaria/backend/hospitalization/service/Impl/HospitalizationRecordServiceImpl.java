package com.veterinaria.backend.hospitalization.service.Impl;

import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.hospitalization.dto.CreateHospitalizationEvolutionDTO;
import com.veterinaria.backend.hospitalization.dto.CreateHospitalizationRecordDTO;
import com.veterinaria.backend.hospitalization.dto.HospitalizationEvolutionDTO;
import com.veterinaria.backend.hospitalization.dto.HospitalizationRecordDTO;
import com.veterinaria.backend.hospitalization.dto.UpdateHospitalizationRecordDTO;
import com.veterinaria.backend.hospitalization.mapper.HospitalizationMapper;
import com.veterinaria.backend.hospitalization.model.HospitalizationEvolution;
import com.veterinaria.backend.hospitalization.model.HospitalizationRecord;
import com.veterinaria.backend.hospitalization.repository.HospitalizationRecordRepository;
import com.veterinaria.backend.hospitalization.service.HospitalizationRecordService;
import com.veterinaria.backend.medicalrecord.model.MedicalRecord;
import com.veterinaria.backend.medicalrecord.repository.MedicalRecordRepository;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.pet.repository.PetRepository;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import com.veterinaria.backend.veterinarian.repository.VeterinarianRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
public class HospitalizationRecordServiceImpl implements HospitalizationRecordService {

    private static final Set<String> STATUSES = Set.of("activo", "alta", "transferido");

    private final HospitalizationRecordRepository hospitalizationRecordRepository;
    private final PetRepository petRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final HospitalizationMapper hospitalizationMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public Page<HospitalizationRecordDTO> getAllHospitalizationRecordsPaginated(UUID petId, String status,
            Instant from, Instant to, String activeStatus, Pageable pageable) {
        return hospitalizationRecordRepository.findAll(buildSpecification(petId, status, from, to, activeStatus), pageable)
                .map(hospitalizationMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public HospitalizationRecordDTO getHospitalizationRecordById(UUID id) {
        return hospitalizationMapper.toDTO(findRecord(id));
    }

    @Override
    @Transactional
    public HospitalizationRecordDTO createHospitalizationRecord(CreateHospitalizationRecordDTO dto) {
        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        MedicalRecord medicalRecord = resolveMedicalRecord(dto.getMedicalRecordId(), pet);
        Veterinarian veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Veterinario no encontrado"));

        HospitalizationRecord record = HospitalizationRecord.builder()
                .pet(pet)
                .medicalRecord(medicalRecord)
                .admissionDate(dto.getAdmissionDate())
                .reason(dto.getReason().trim())
                .cageNumber(trimToNull(dto.getCageNumber()))
                .veterinarian(veterinarian)
                .build();

        return hospitalizationMapper.toDTO(hospitalizationRecordRepository.saveAndFlush(record));
    }

    @Override
    @Transactional
    public HospitalizationRecordDTO updateHospitalizationRecord(UUID id, UpdateHospitalizationRecordDTO dto) {
        HospitalizationRecord record = findRecord(id);

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        MedicalRecord medicalRecord = resolveMedicalRecord(dto.getMedicalRecordId(), pet);
        Veterinarian veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Veterinario no encontrado"));
        String status = validateStatus(dto.getStatus());
        if (dto.getDischargeDate() != null && dto.getDischargeDate().isBefore(dto.getAdmissionDate())) {
            throw new BusinessException("La fecha de alta debe ser posterior a la fecha de ingreso");
        }

        record.setPet(pet);
        record.setMedicalRecord(medicalRecord);
        record.setAdmissionDate(dto.getAdmissionDate());
        record.setDischargeDate(dto.getDischargeDate());
        record.setReason(dto.getReason().trim());
        record.setCageNumber(trimToNull(dto.getCageNumber()));
        record.setVeterinarian(veterinarian);
        record.setStatus(status);
        record.setFinalDiagnosis(trimToNull(dto.getFinalDiagnosis()));
        record.setDischargeNotes(trimToNull(dto.getDischargeNotes()));

        return hospitalizationMapper.toDTO(hospitalizationRecordRepository.saveAndFlush(record));
    }

    @Override
    @Transactional
    public void deleteHospitalizationRecord(UUID id) {
        HospitalizationRecord record = findRecord(id);
        record.setIsActive(false);
        hospitalizationRecordRepository.saveAndFlush(record);
    }

    @Override
    @Transactional
    public void reactivateHospitalizationRecord(UUID id) {
        HospitalizationRecord record = hospitalizationRecordRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Registro de hospitalización no encontrado"));
        record.setIsActive(true);
        hospitalizationRecordRepository.saveAndFlush(record);
    }

    @Override
    @Transactional
    public HospitalizationEvolutionDTO addEvolution(UUID hospitalizationId, CreateHospitalizationEvolutionDTO dto) {
        HospitalizationRecord record = findRecord(hospitalizationId);
        Veterinarian veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Veterinario no encontrado"));

        HospitalizationEvolution evolution = HospitalizationEvolution.builder()
                .hospitalizationRecord(record)
                .evolutionDate(dto.getEvolutionDate())
                .veterinarian(veterinarian)
                .weight(dto.getWeight())
                .temperature(dto.getTemperature())
                .heartRate(dto.getHeartRate())
                .respiratoryRate(dto.getRespiratoryRate())
                .foodIntake(trimToNull(dto.getFoodIntake()))
                .waterIntake(trimToNull(dto.getWaterIntake()))
                .urination(trimToNull(dto.getUrination()))
                .defecation(trimToNull(dto.getDefecation()))
                .activityLevel(trimToNull(dto.getActivityLevel()))
                .medicationAdministered(trimToNull(dto.getMedicationAdministered()))
                .proceduresPerformed(trimToNull(dto.getProceduresPerformed()))
                .observations(trimToNull(dto.getObservations()))
                .build();
        record.getEvolutions().add(evolution);
        // record ya está managed (viene de findById): usar flush() directo en vez de
        // repository.saveAndFlush() evita un merge() innecesario, que cascadearía la
        // persistencia del hijo nuevo sobre una copia interna en vez de mutar esta
        // misma instancia de "evolution" (dejando su id/createdAt en null).
        entityManager.flush();

        return hospitalizationMapper.toDTO(evolution);
    }

    @Override
    @Transactional
    public void deleteEvolution(UUID hospitalizationId, UUID evolutionId) {
        HospitalizationRecord record = findRecord(hospitalizationId);
        HospitalizationEvolution evolution = record.getEvolutions().stream()
                .filter(e -> e.getId().equals(evolutionId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Evolución no encontrada"));
        record.getEvolutions().remove(evolution);
        entityManager.flush();
    }

    ////////////////////////////////////////////////////////////////
    // Privados
    ////////////////////////////////////////////////////////////////

    private HospitalizationRecord findRecord(UUID id) {
        return hospitalizationRecordRepository.findById(id)
                .filter(HospitalizationRecord::getIsActive)
                .orElseThrow(() -> new NotFoundException("Registro de hospitalización no encontrado"));
    }

    private MedicalRecord resolveMedicalRecord(UUID medicalRecordId, Pet pet) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(() -> new NotFoundException("Registro médico no encontrado"));
        if (!medicalRecord.getPet().getId().equals(pet.getId())) {
            throw new BusinessException("El registro médico seleccionado no corresponde a la mascota indicada");
        }
        return medicalRecord;
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

    private Specification<HospitalizationRecord> buildSpecification(UUID petId, String status, Instant from, Instant to, String activeStatus) {
        Specification<HospitalizationRecord> spec = (root, query, cb) -> cb.conjunction();

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
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status.trim().toLowerCase()));
        }
        if (from != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("admissionDate"), from));
        }
        if (to != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("admissionDate"), to));
        }
        return spec;
    }
}
