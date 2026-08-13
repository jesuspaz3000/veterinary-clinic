package com.veterinaria.backend.deworming.service;

import com.veterinaria.backend.deworming.dto.CreateDewormingRecordDTO;
import com.veterinaria.backend.deworming.dto.DewormingRecordDTO;
import com.veterinaria.backend.deworming.dto.UpdateDewormingRecordDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface DewormingRecordService {

    Page<DewormingRecordDTO> getAllDewormingRecordsPaginated(UUID petId, UUID veterinarianId, String dewormingType,
            LocalDate applicationFrom, LocalDate applicationTo, LocalDate nextApplicationFrom, LocalDate nextApplicationTo,
            Pageable pageable);

    DewormingRecordDTO getDewormingRecordById(UUID id);

    DewormingRecordDTO createDewormingRecord(CreateDewormingRecordDTO dto);

    DewormingRecordDTO updateDewormingRecord(UUID id, UpdateDewormingRecordDTO dto);

    void deleteDewormingRecord(UUID id);
}
