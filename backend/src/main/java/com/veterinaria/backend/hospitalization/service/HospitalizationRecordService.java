package com.veterinaria.backend.hospitalization.service;

import com.veterinaria.backend.hospitalization.dto.CreateHospitalizationEvolutionDTO;
import com.veterinaria.backend.hospitalization.dto.CreateHospitalizationRecordDTO;
import com.veterinaria.backend.hospitalization.dto.HospitalizationEvolutionDTO;
import com.veterinaria.backend.hospitalization.dto.HospitalizationRecordDTO;
import com.veterinaria.backend.hospitalization.dto.UpdateHospitalizationRecordDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.UUID;

public interface HospitalizationRecordService {

    Page<HospitalizationRecordDTO> getAllHospitalizationRecordsPaginated(UUID petId, String status,
            Instant from, Instant to, String activeStatus, Pageable pageable);

    HospitalizationRecordDTO getHospitalizationRecordById(UUID id);

    HospitalizationRecordDTO createHospitalizationRecord(CreateHospitalizationRecordDTO dto);

    HospitalizationRecordDTO updateHospitalizationRecord(UUID id, UpdateHospitalizationRecordDTO dto);

    void deleteHospitalizationRecord(UUID id);

    void reactivateHospitalizationRecord(UUID id);

    HospitalizationEvolutionDTO addEvolution(UUID hospitalizationId, CreateHospitalizationEvolutionDTO dto);

    void deleteEvolution(UUID hospitalizationId, UUID evolutionId);
}
