package com.veterinaria.backend.surgery.service;

import com.veterinaria.backend.surgery.dto.CreateSurgeryRecordDTO;
import com.veterinaria.backend.surgery.dto.SurgeryRecordDTO;
import com.veterinaria.backend.surgery.dto.UpdateSurgeryRecordDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.UUID;

public interface SurgeryRecordService {

    Page<SurgeryRecordDTO> getAllSurgeryRecordsPaginated(UUID petId, UUID veterinarianId, String surgeryType,
            String status, Instant from, Instant to, Pageable pageable);

    SurgeryRecordDTO getSurgeryRecordById(UUID id);

    SurgeryRecordDTO createSurgeryRecord(CreateSurgeryRecordDTO dto);

    SurgeryRecordDTO updateSurgeryRecord(UUID id, UpdateSurgeryRecordDTO dto);

    void deleteSurgeryRecord(UUID id);
}
