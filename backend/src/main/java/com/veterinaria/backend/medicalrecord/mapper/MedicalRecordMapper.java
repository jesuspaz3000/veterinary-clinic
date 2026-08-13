package com.veterinaria.backend.medicalrecord.mapper;

import com.veterinaria.backend.common.storage.StorageService;
import com.veterinaria.backend.medicalrecord.dto.MedicalDocumentDTO;
import com.veterinaria.backend.medicalrecord.dto.MedicalRecordDTO;
import com.veterinaria.backend.medicalrecord.dto.PrescriptionDTO;
import com.veterinaria.backend.medicalrecord.model.MedicalDocument;
import com.veterinaria.backend.medicalrecord.model.MedicalRecord;
import com.veterinaria.backend.medicalrecord.model.Prescription;
import com.veterinaria.backend.pet.mapper.PetMapper;
import com.veterinaria.backend.veterinarian.mapper.VeterinarianMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;

@Component
@RequiredArgsConstructor
public class MedicalRecordMapper {

    private final PetMapper petMapper;
    private final VeterinarianMapper veterinarianMapper;
    private final StorageService storageService;

    public MedicalRecordDTO toDTO(MedicalRecord record) {
        if (record == null) return null;

        return MedicalRecordDTO.builder()
                .id(record.getId())
                .pet(petMapper.toDTO(record.getPet()))
                .veterinarian(veterinarianMapper.toDTO(record.getVeterinarian()))
                .appointmentId(record.getAppointment() != null ? record.getAppointment().getId() : null)
                .recordType(record.getRecordType())
                .recordDate(record.getRecordDate())
                .reason(record.getReason())
                .symptoms(record.getSymptoms())
                .diagnosis(record.getDiagnosis())
                .treatment(record.getTreatment())
                .observations(record.getObservations())
                .weight(record.getWeight())
                .temperature(record.getTemperature())
                .heartRate(record.getHeartRate())
                .respiratoryRate(record.getRespiratoryRate())
                .followUpDate(record.getFollowUpDate())
                .status(record.getStatus())
                .prescriptions(record.getPrescriptions().stream()
                        .sorted(Comparator.comparing(Prescription::getCreatedAt))
                        .map(this::toDTO)
                        .toList())
                .documents(record.getDocuments().stream()
                        .sorted(Comparator.comparing(MedicalDocument::getUploadedAt))
                        .map(this::toDTO)
                        .toList())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }

    public PrescriptionDTO toDTO(Prescription prescription) {
        if (prescription == null) return null;

        return PrescriptionDTO.builder()
                .id(prescription.getId())
                .productId(prescription.getProduct() != null ? prescription.getProduct().getId() : null)
                .productName(prescription.getProduct() != null ? prescription.getProduct().getName() : null)
                .medicationName(prescription.getMedicationName())
                .dosage(prescription.getDosage())
                .frequency(prescription.getFrequency())
                .durationDays(prescription.getDurationDays())
                .instructions(prescription.getInstructions())
                .createdAt(prescription.getCreatedAt())
                .build();
    }

    public MedicalDocumentDTO toDTO(MedicalDocument document) {
        if (document == null) return null;

        return MedicalDocumentDTO.builder()
                .id(document.getId())
                .documentType(document.getDocumentType())
                .documentUrl(storageService.resolveUrl(document.getDocumentUrl()))
                .fileName(document.getFileName())
                .description(document.getDescription())
                .uploadedAt(document.getUploadedAt())
                .build();
    }
}
