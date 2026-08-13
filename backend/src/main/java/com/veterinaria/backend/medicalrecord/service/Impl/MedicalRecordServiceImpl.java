package com.veterinaria.backend.medicalrecord.service.Impl;

import com.veterinaria.backend.appointment.model.Appointment;
import com.veterinaria.backend.appointment.repository.AppointmentRepository;
import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.common.storage.StorageFolder;
import com.veterinaria.backend.common.storage.StorageService;
import com.veterinaria.backend.medicalrecord.dto.BaseMedicalRecordDTO;
import com.veterinaria.backend.medicalrecord.dto.CreateMedicalRecordDTO;
import com.veterinaria.backend.medicalrecord.dto.MedicalDocumentDTO;
import com.veterinaria.backend.medicalrecord.dto.MedicalRecordDTO;
import com.veterinaria.backend.medicalrecord.dto.PrescriptionItemDTO;
import com.veterinaria.backend.medicalrecord.dto.UpdateMedicalRecordDTO;
import com.veterinaria.backend.medicalrecord.mapper.MedicalRecordMapper;
import com.veterinaria.backend.medicalrecord.model.MedicalDocument;
import com.veterinaria.backend.medicalrecord.model.MedicalRecord;
import com.veterinaria.backend.medicalrecord.model.Prescription;
import com.veterinaria.backend.medicalrecord.repository.MedicalRecordRepository;
import com.veterinaria.backend.medicalrecord.service.MedicalRecordService;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.pet.repository.PetRepository;
import com.veterinaria.backend.product.model.Product;
import com.veterinaria.backend.product.repository.ProductRepository;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import com.veterinaria.backend.veterinarian.repository.VeterinarianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private static final Set<String> RECORD_TYPES = Set.of(
            "consulta", "cirugia", "vacunacion", "desparasitacion", "emergencia", "hospitalizacion");
    private static final Set<String> STATUSES = Set.of("completado", "pendiente_seguimiento");

    private final MedicalRecordRepository medicalRecordRepository;
    private final PetRepository petRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final AppointmentRepository appointmentRepository;
    private final ProductRepository productRepository;
    private final MedicalRecordMapper medicalRecordMapper;
    private final StorageService storageService;

    @Override
    @Transactional(readOnly = true)
    public Page<MedicalRecordDTO> getAllMedicalRecordsPaginated(UUID petId, UUID veterinarianId, String recordType,
                                                                String status, LocalDate from, LocalDate to, Pageable pageable) {
        return medicalRecordRepository.findAll(buildSpecification(petId, veterinarianId, recordType, status, from, to), pageable)
                .map(medicalRecordMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalRecordDTO getMedicalRecordById(UUID id) {
        return medicalRecordMapper.toDTO(findRecord(id));
    }

    @Override
    @Transactional
    public MedicalRecordDTO createMedicalRecord(CreateMedicalRecordDTO dto) {
        validateRecordValues(dto.getRecordType(), dto.getStatus());

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        Veterinarian veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Veterinario no encontrado"));
        Appointment appointment = resolveAppointment(dto.getAppointmentId(), pet);

        MedicalRecord record = MedicalRecord.builder()
                .pet(pet)
                .veterinarian(veterinarian)
                .appointment(appointment)
                .build();
        applyFields(record, dto);
        replacePrescriptions(record, dto.getPrescriptions());

        return medicalRecordMapper.toDTO(medicalRecordRepository.saveAndFlush(record));
    }

    @Override
    @Transactional
    public MedicalRecordDTO updateMedicalRecord(UUID id, UpdateMedicalRecordDTO dto) {
        MedicalRecord record = findRecord(id);
        validateRecordValues(dto.getRecordType(), dto.getStatus());

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new NotFoundException("Mascota no encontrada"));
        Veterinarian veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Veterinario no encontrado"));
        Appointment appointment = resolveAppointment(dto.getAppointmentId(), pet);

        record.setPet(pet);
        record.setVeterinarian(veterinarian);
        record.setAppointment(appointment);
        applyFields(record, dto);
        replacePrescriptions(record, dto.getPrescriptions());

        return medicalRecordMapper.toDTO(medicalRecordRepository.saveAndFlush(record));
    }

    @Override
    @Transactional
    public void deleteMedicalRecord(UUID id) {
        MedicalRecord record = findRecord(id);
        // Elimina los archivos adjuntos del storage antes de borrar el registro
        record.getDocuments().forEach(doc -> {
            try {
                storageService.delete(doc.getDocumentUrl());
            } catch (Exception ignored) {
                // El archivo puede no existir físicamente; la fila se elimina igual
            }
        });
        medicalRecordRepository.delete(record);
    }

    @Override
    @Transactional
    public MedicalDocumentDTO uploadDocument(UUID recordId, MultipartFile file, String documentType, String description) {
        MedicalRecord record = findRecord(recordId);

        if (file == null || file.isEmpty()) {
            throw new BusinessException("Debes adjuntar un archivo para el documento");
        }
        if (documentType == null || documentType.trim().isEmpty()) {
            throw new BusinessException("El tipo de documento es obligatorio");
        }

        String storedPath = storageService.save(file, StorageFolder.MEDICAL_DOCUMENTS);
        MedicalDocument document = MedicalDocument.builder()
                .record(record)
                .documentType(documentType.trim())
                .documentUrl(storedPath)
                .fileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "documento")
                .description(description != null && !description.trim().isEmpty() ? description.trim() : null)
                .build();
        record.getDocuments().add(document);
        medicalRecordRepository.saveAndFlush(record);

        return medicalRecordMapper.toDTO(document);
    }

    @Override
    @Transactional
    public void deleteDocument(UUID recordId, UUID documentId) {
        MedicalRecord record = findRecord(recordId);
        MedicalDocument document = record.getDocuments().stream()
                .filter(doc -> doc.getId().equals(documentId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Documento no encontrado"));

        try {
            storageService.delete(document.getDocumentUrl());
        } catch (Exception ignored) {
            // El archivo puede no existir físicamente; la fila se elimina igual
        }
        record.getDocuments().remove(document);
        medicalRecordRepository.save(record);
    }

    ////////////////////////////////////////////////////////////////
    // Privados
    ////////////////////////////////////////////////////////////////

    private MedicalRecord findRecord(UUID id) {
        return medicalRecordRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Registro médico no encontrado"));
    }

    private void validateRecordValues(String recordType, String status) {
        if (recordType != null && !RECORD_TYPES.contains(recordType)) {
            throw new BusinessException("Tipo de registro médico inválido");
        }
        if (status != null && !STATUSES.contains(status)) {
            throw new BusinessException("Estado del registro médico inválido");
        }
    }

    private Appointment resolveAppointment(UUID appointmentId, Pet pet) {
        if (appointmentId == null) return null;
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Cita no encontrada"));
        if (!appointment.getPet().getId().equals(pet.getId())) {
            throw new BusinessException("La cita seleccionada no corresponde a la mascota del registro");
        }
        return appointment;
    }

    private void applyFields(MedicalRecord record, BaseMedicalRecordDTO dto) {
        record.setRecordType(dto.getRecordType().trim());
        record.setRecordDate(dto.getRecordDate());
        record.setReason(trimToNull(dto.getReason()));
        record.setSymptoms(trimToNull(dto.getSymptoms()));
        record.setDiagnosis(trimToNull(dto.getDiagnosis()));
        record.setTreatment(trimToNull(dto.getTreatment()));
        record.setObservations(trimToNull(dto.getObservations()));
        record.setWeight(dto.getWeight());
        record.setTemperature(dto.getTemperature());
        record.setHeartRate(dto.getHeartRate());
        record.setRespiratoryRate(dto.getRespiratoryRate());
        record.setFollowUpDate(dto.getFollowUpDate());
        if (dto.getStatus() != null) {
            record.setStatus(dto.getStatus());
        }
    }

    /** Reemplaza todas las prescripciones del registro (orphanRemoval elimina las anteriores) */
    private void replacePrescriptions(MedicalRecord record, List<PrescriptionItemDTO> items) {
        record.getPrescriptions().clear();
        if (items == null) return;
        for (PrescriptionItemDTO item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new NotFoundException("Producto de la prescripción no encontrado"));
            record.getPrescriptions().add(Prescription.builder()
                    .record(record)
                    .product(product)
                    .medicationName(product.getName())
                    .dosage(item.getDosage().trim())
                    .frequency(item.getFrequency().trim())
                    .durationDays(item.getDurationDays())
                    .instructions(trimToNull(item.getInstructions()))
                    .build());
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Specification<MedicalRecord> buildSpecification(UUID petId, UUID veterinarianId, String recordType,
                                                            String status, LocalDate from, LocalDate to) {
        Specification<MedicalRecord> spec = (root, query, cb) -> cb.conjunction();
        if (petId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("pet").get("id"), petId));
        }
        if (veterinarianId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("veterinarian").get("id"), veterinarianId));
        }
        if (recordType != null && !recordType.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("recordType"), recordType));
        }
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (from != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("recordDate"), from.atStartOfDay(ZoneId.systemDefault()).toInstant()));
        }
        if (to != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("recordDate"), to.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant()));
        }
        return spec;
    }
}
