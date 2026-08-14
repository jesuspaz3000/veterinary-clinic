package com.veterinaria.backend.vaccination.service.Impl;

import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.medicalrecord.model.MedicalRecord;
import com.veterinaria.backend.medicalrecord.repository.MedicalRecordRepository;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.pet.repository.PetRepository;
import com.veterinaria.backend.product.model.Product;
import com.veterinaria.backend.product.repository.ProductRepository;
import com.veterinaria.backend.vaccination.dto.CreateVaccinationRecordDTO;
import com.veterinaria.backend.vaccination.dto.UpdateVaccinationRecordDTO;
import com.veterinaria.backend.vaccination.dto.VaccinationRecordDTO;
import com.veterinaria.backend.vaccination.mapper.VaccinationRecordMapper;
import com.veterinaria.backend.vaccination.model.VaccinationRecord;
import com.veterinaria.backend.vaccination.repository.VaccinationRecordRepository;
import com.veterinaria.backend.vaccination.service.VaccinationRecordService;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import com.veterinaria.backend.veterinarian.repository.VeterinarianRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VaccinationRecordServiceImpl implements VaccinationRecordService {

    private final VaccinationRecordRepository vaccinationRecordRepository;
    private final PetRepository petRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final ProductRepository productRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccinationRecordMapper vaccinationRecordMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<VaccinationRecordDTO> getAllVaccinationRecordsPaginated(UUID petId, UUID veterinarianId,
            LocalDate applicationFrom, LocalDate applicationTo, LocalDate nextDoseFrom, LocalDate nextDoseTo,
            String status, Pageable pageable) {
        return vaccinationRecordRepository.findAll(
                        buildSpecification(petId, veterinarianId, applicationFrom, applicationTo, nextDoseFrom, nextDoseTo, status), pageable)
                .map(vaccinationRecordMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public VaccinationRecordDTO getVaccinationRecordById(UUID id) {
        return vaccinationRecordMapper.toDTO(findRecord(id));
    }

    @Override
    @Transactional
    public VaccinationRecordDTO createVaccinationRecord(CreateVaccinationRecordDTO dto) {
        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        Veterinarian veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Veterinario no encontrado"));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new NotFoundException("Producto/vacuna no encontrado"));
        MedicalRecord medicalRecord = resolveMedicalRecord(dto.getMedicalRecordId(), pet);
        validateDoseDates(dto.getApplicationDate(), dto.getNextDoseDate());

        VaccinationRecord record = VaccinationRecord.builder()
                .pet(pet)
                .medicalRecord(medicalRecord)
                .product(product)
                .veterinarian(veterinarian)
                .vaccineName(product.getName())
                .vaccineBrand(product.getBrand() != null ? product.getBrand().getName() : null)
                .batchNumber(trimToNull(dto.getBatchNumber()))
                .applicationDate(dto.getApplicationDate())
                .nextDoseDate(dto.getNextDoseDate())
                .observations(trimToNull(dto.getObservations()))
                .build();

        return vaccinationRecordMapper.toDTO(vaccinationRecordRepository.saveAndFlush(record));
    }

    @Override
    @Transactional
    public VaccinationRecordDTO updateVaccinationRecord(UUID id, UpdateVaccinationRecordDTO dto) {
        VaccinationRecord record = findRecord(id);

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        Veterinarian veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Veterinario no encontrado"));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new NotFoundException("Producto/vacuna no encontrado"));
        MedicalRecord medicalRecord = resolveMedicalRecord(dto.getMedicalRecordId(), pet);
        validateDoseDates(dto.getApplicationDate(), dto.getNextDoseDate());

        record.setPet(pet);
        record.setMedicalRecord(medicalRecord);
        record.setProduct(product);
        record.setVeterinarian(veterinarian);
        record.setVaccineName(product.getName());
        record.setVaccineBrand(product.getBrand() != null ? product.getBrand().getName() : null);
        record.setBatchNumber(trimToNull(dto.getBatchNumber()));
        record.setApplicationDate(dto.getApplicationDate());
        record.setNextDoseDate(dto.getNextDoseDate());
        record.setObservations(trimToNull(dto.getObservations()));

        return vaccinationRecordMapper.toDTO(vaccinationRecordRepository.saveAndFlush(record));
    }

    @Override
    @Transactional
    public void deleteVaccinationRecord(UUID id) {
        VaccinationRecord record = findRecord(id);
        record.setIsActive(false);
        vaccinationRecordRepository.saveAndFlush(record);
    }

    @Override
    @Transactional
    public void reactivateVaccinationRecord(UUID id) {
        VaccinationRecord record = vaccinationRecordRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Registro de vacunación no encontrado"));
        record.setIsActive(true);
        vaccinationRecordRepository.saveAndFlush(record);
    }

    ////////////////////////////////////////////////////////////////
    // Privados
    ////////////////////////////////////////////////////////////////

    private VaccinationRecord findRecord(UUID id) {
        return vaccinationRecordRepository.findById(id)
                .filter(VaccinationRecord::getIsActive)
                .orElseThrow(() -> new NotFoundException("Registro de vacunación no encontrado"));
    }

    private MedicalRecord resolveMedicalRecord(UUID medicalRecordId, Pet pet) {
        if (medicalRecordId == null) return null;
        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(() -> new NotFoundException("Registro médico no encontrado"));
        if (!medicalRecord.getPet().getId().equals(pet.getId())) {
            throw new BusinessException("El registro médico seleccionado no corresponde a la mascota indicada");
        }
        return medicalRecord;
    }

    private void validateDoseDates(LocalDate applicationDate, LocalDate nextDoseDate) {
        if (nextDoseDate != null && !nextDoseDate.isAfter(applicationDate)) {
            throw new BusinessException("La fecha de la próxima dosis debe ser posterior a la fecha de aplicación");
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Specification<VaccinationRecord> buildSpecification(UUID petId, UUID veterinarianId,
            LocalDate applicationFrom, LocalDate applicationTo, LocalDate nextDoseFrom, LocalDate nextDoseTo,
            String status) {
        Specification<VaccinationRecord> spec = (root, query, cb) -> cb.conjunction();

        if (status == null || status.isBlank()) {
            // Por defecto solo se listan registros activos
            spec = spec.and((root, query, cb) -> cb.isTrue(root.get("isActive")));
        } else if ("inactivo".equalsIgnoreCase(status.trim())) {
            spec = spec.and((root, query, cb) -> cb.isFalse(root.get("isActive")));
        } else if (!"todos".equalsIgnoreCase(status.trim())) {
            spec = spec.and((root, query, cb) -> cb.isTrue(root.get("isActive")));
        }
        // status == "todos": sin filtro de estado, se listan todos

        if (petId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("pet").get("id"), petId));
        }
        if (veterinarianId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("veterinarian").get("id"), veterinarianId));
        }
        if (applicationFrom != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("applicationDate"), applicationFrom));
        }
        if (applicationTo != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("applicationDate"), applicationTo));
        }
        if (nextDoseFrom != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("nextDoseDate"), nextDoseFrom));
        }
        if (nextDoseTo != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("nextDoseDate"), nextDoseTo));
        }
        return spec;
    }
}
