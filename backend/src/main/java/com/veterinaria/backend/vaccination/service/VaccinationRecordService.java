package com.veterinaria.backend.vaccination.service;

import com.veterinaria.backend.vaccination.dto.CreateVaccinationRecordDTO;
import com.veterinaria.backend.vaccination.dto.UpdateVaccinationRecordDTO;
import com.veterinaria.backend.vaccination.dto.VaccinationRecordDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface VaccinationRecordService {

    Page<VaccinationRecordDTO> getAllVaccinationRecordsPaginated(UUID petId, UUID veterinarianId,
            LocalDate applicationFrom, LocalDate applicationTo, LocalDate nextDoseFrom, LocalDate nextDoseTo,
            Pageable pageable);

    VaccinationRecordDTO getVaccinationRecordById(UUID id);

    VaccinationRecordDTO createVaccinationRecord(CreateVaccinationRecordDTO dto);

    VaccinationRecordDTO updateVaccinationRecord(UUID id, UpdateVaccinationRecordDTO dto);

    void deleteVaccinationRecord(UUID id);
}
