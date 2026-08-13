package com.veterinaria.backend.medicalrecord.service;

import com.veterinaria.backend.medicalrecord.dto.CreateMedicalRecordDTO;
import com.veterinaria.backend.medicalrecord.dto.MedicalDocumentDTO;
import com.veterinaria.backend.medicalrecord.dto.MedicalRecordDTO;
import com.veterinaria.backend.medicalrecord.dto.UpdateMedicalRecordDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.UUID;

public interface MedicalRecordService {

    Page<MedicalRecordDTO> getAllMedicalRecordsPaginated(UUID petId, UUID veterinarianId, String recordType,
                                                         String status, LocalDate from, LocalDate to, Pageable pageable);

    MedicalRecordDTO getMedicalRecordById(UUID id);

    MedicalRecordDTO createMedicalRecord(CreateMedicalRecordDTO dto);

    MedicalRecordDTO updateMedicalRecord(UUID id, UpdateMedicalRecordDTO dto);

    void deleteMedicalRecord(UUID id);

    MedicalDocumentDTO uploadDocument(UUID recordId, MultipartFile file, String documentType, String description);

    void deleteDocument(UUID recordId, UUID documentId);
}
