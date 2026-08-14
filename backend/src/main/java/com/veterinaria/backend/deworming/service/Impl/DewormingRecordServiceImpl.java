package com.veterinaria.backend.deworming.service.Impl;

import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.deworming.dto.CreateDewormingRecordDTO;
import com.veterinaria.backend.deworming.dto.DewormingRecordDTO;
import com.veterinaria.backend.deworming.dto.UpdateDewormingRecordDTO;
import com.veterinaria.backend.deworming.mapper.DewormingRecordMapper;
import com.veterinaria.backend.deworming.model.DewormingRecord;
import com.veterinaria.backend.deworming.repository.DewormingRecordRepository;
import com.veterinaria.backend.deworming.service.DewormingRecordService;
import com.veterinaria.backend.medicalrecord.model.MedicalRecord;
import com.veterinaria.backend.medicalrecord.repository.MedicalRecordRepository;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.pet.repository.PetRepository;
import com.veterinaria.backend.product.model.Product;
import com.veterinaria.backend.product.model.ProductVariant;
import com.veterinaria.backend.product.repository.ProductRepository;
import com.veterinaria.backend.product.repository.ProductVariantRepository;
import com.veterinaria.backend.sales.service.InventoryMovementService;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import com.veterinaria.backend.veterinarian.repository.VeterinarianRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DewormingRecordServiceImpl implements DewormingRecordService {

    private static final Set<String> DEWORMING_TYPES = Set.of("interna", "externa", "ambas");

    private final DewormingRecordRepository dewormingRecordRepository;
    private final PetRepository petRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final InventoryMovementService inventoryMovementService;
    private final UserRepository userRepository;
    private final DewormingRecordMapper dewormingRecordMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<DewormingRecordDTO> getAllDewormingRecordsPaginated(UUID petId, UUID veterinarianId, String dewormingType,
            LocalDate applicationFrom, LocalDate applicationTo, LocalDate nextApplicationFrom, LocalDate nextApplicationTo,
            String status, Pageable pageable) {
        return dewormingRecordRepository.findAll(
                        buildSpecification(petId, veterinarianId, dewormingType, applicationFrom, applicationTo,
                                nextApplicationFrom, nextApplicationTo, status), pageable)
                .map(dewormingRecordMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public DewormingRecordDTO getDewormingRecordById(UUID id) {
        return dewormingRecordMapper.toDTO(findRecord(id));
    }

    @Override
    @Transactional
    public DewormingRecordDTO createDewormingRecord(CreateDewormingRecordDTO dto, UUID currentUserId) {
        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        Veterinarian veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Veterinario no encontrado"));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new NotFoundException("Producto antiparasitario no encontrado"));
        MedicalRecord medicalRecord = resolveMedicalRecord(dto.getMedicalRecordId(), pet);
        String dewormingType = validateDewormingType(dto.getDewormingType());
        validateDoseDates(dto.getApplicationDate(), dto.getNextApplicationDate());

        // Bloqueo pesimista: evita que dos aplicaciones concurrentes con la misma
        // presentación validen stock suficiente antes de que ninguna lo haya descontado.
        ProductVariant variant = productVariantRepository.findByIdForUpdate(dto.getProductVariantId())
                .orElseThrow(() -> new NotFoundException("Presentación del producto no encontrada"));
        if (!variant.getProduct().getId().equals(product.getId())) {
            throw new BusinessException("La presentación seleccionada no corresponde al producto antiparasitario indicado");
        }
        if (!Boolean.TRUE.equals(variant.getIsActive())) {
            throw new BusinessException("La presentación '" + variant.getName() + "' está inactiva");
        }
        int currentStock = variant.getStock() != null ? variant.getStock() : 0;
        if (currentStock < 1) {
            throw new BusinessException("Sin stock disponible de '" + variant.getName() + "' para aplicar el antiparasitario");
        }
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException("Usuario autenticado no encontrado"));

        DewormingRecord record = DewormingRecord.builder()
                .pet(pet)
                .medicalRecord(medicalRecord)
                .product(product)
                .productVariant(variant)
                .productName(product.getName())
                .productBrand(product.getBrand() != null ? product.getBrand().getName() : null)
                .veterinarian(veterinarian)
                .dosage(dto.getDosage().trim())
                .applicationDate(dto.getApplicationDate())
                .nextApplicationDate(dto.getNextApplicationDate())
                .dewormingType(dewormingType)
                .observations(trimToNull(dto.getObservations()))
                .build();

        DewormingRecord saved = dewormingRecordRepository.saveAndFlush(record);

        inventoryMovementService.consumeStock(
                variant,
                BigDecimal.ONE,
                "uso_clinico",
                "deworming_record",
                saved.getId(),
                "Desparasitación aplicada a " + pet.getName(),
                currentUser
        );

        return dewormingRecordMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public DewormingRecordDTO updateDewormingRecord(UUID id, UpdateDewormingRecordDTO dto) {
        DewormingRecord record = findRecord(id);

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        Veterinarian veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Veterinario no encontrado"));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new NotFoundException("Producto antiparasitario no encontrado"));
        MedicalRecord medicalRecord = resolveMedicalRecord(dto.getMedicalRecordId(), pet);
        String dewormingType = validateDewormingType(dto.getDewormingType());
        validateDoseDates(dto.getApplicationDate(), dto.getNextApplicationDate());
        // La presentación (productVariant) queda fija a la del producto con el que se
        // descontó stock al crear el registro; no se admite cambiar de producto en una
        // edición porque dejaría esa referencia inconsistente.
        if (!record.getProduct().getId().equals(product.getId())) {
            throw new BusinessException("No se puede cambiar el producto antiparasitario de un registro ya aplicado; crea un nuevo registro en su lugar");
        }

        record.setPet(pet);
        record.setMedicalRecord(medicalRecord);
        record.setProduct(product);
        record.setProductName(product.getName());
        record.setProductBrand(product.getBrand() != null ? product.getBrand().getName() : null);
        record.setVeterinarian(veterinarian);
        record.setDosage(dto.getDosage().trim());
        record.setApplicationDate(dto.getApplicationDate());
        record.setNextApplicationDate(dto.getNextApplicationDate());
        record.setDewormingType(dewormingType);
        record.setObservations(trimToNull(dto.getObservations()));

        return dewormingRecordMapper.toDTO(dewormingRecordRepository.saveAndFlush(record));
    }

    @Override
    @Transactional
    public void deleteDewormingRecord(UUID id) {
        DewormingRecord record = findRecord(id);
        record.setIsActive(false);
        dewormingRecordRepository.saveAndFlush(record);
    }

    @Override
    @Transactional
    public void reactivateDewormingRecord(UUID id) {
        DewormingRecord record = dewormingRecordRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Registro de desparasitación no encontrado"));
        record.setIsActive(true);
        dewormingRecordRepository.saveAndFlush(record);
    }

    ////////////////////////////////////////////////////////////////
    // Privados
    ////////////////////////////////////////////////////////////////

    private DewormingRecord findRecord(UUID id) {
        return dewormingRecordRepository.findById(id)
                .filter(DewormingRecord::getIsActive)
                .orElseThrow(() -> new NotFoundException("Registro de desparasitación no encontrado"));
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

    private String validateDewormingType(String dewormingType) {
        String normalized = dewormingType == null ? "" : dewormingType.trim().toLowerCase();
        if (!DEWORMING_TYPES.contains(normalized)) {
            throw new BusinessException("Tipo de desparasitación inválido. Valores permitidos: " + String.join(", ", DEWORMING_TYPES));
        }
        return normalized;
    }

    private void validateDoseDates(LocalDate applicationDate, LocalDate nextApplicationDate) {
        if (nextApplicationDate != null && !nextApplicationDate.isAfter(applicationDate)) {
            throw new BusinessException("La fecha de la próxima aplicación debe ser posterior a la fecha de aplicación");
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Specification<DewormingRecord> buildSpecification(UUID petId, UUID veterinarianId, String dewormingType,
            LocalDate applicationFrom, LocalDate applicationTo, LocalDate nextApplicationFrom, LocalDate nextApplicationTo,
            String status) {
        Specification<DewormingRecord> spec = (root, query, cb) -> cb.conjunction();

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
        if (dewormingType != null && !dewormingType.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("dewormingType"), dewormingType.trim().toLowerCase()));
        }
        if (applicationFrom != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("applicationDate"), applicationFrom));
        }
        if (applicationTo != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("applicationDate"), applicationTo));
        }
        if (nextApplicationFrom != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("nextApplicationDate"), nextApplicationFrom));
        }
        if (nextApplicationTo != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("nextApplicationDate"), nextApplicationTo));
        }
        return spec;
    }
}
