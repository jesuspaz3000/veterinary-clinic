package com.veterinaria.backend.deworming.mapper;

import com.veterinaria.backend.deworming.dto.DewormingRecordDTO;
import com.veterinaria.backend.deworming.model.DewormingRecord;
import com.veterinaria.backend.pet.mapper.PetMapper;
import com.veterinaria.backend.veterinarian.mapper.VeterinarianMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DewormingRecordMapper {

    private final PetMapper petMapper;
    private final VeterinarianMapper veterinarianMapper;

    public DewormingRecordDTO toDTO(DewormingRecord record) {
        if (record == null) return null;

        return DewormingRecordDTO.builder()
                .id(record.getId())
                .pet(petMapper.toDTO(record.getPet()))
                .medicalRecordId(record.getMedicalRecord() != null ? record.getMedicalRecord().getId() : null)
                .productId(record.getProduct().getId())
                .productName(record.getProductName())
                .productBrand(record.getProductBrand())
                .veterinarian(veterinarianMapper.toDTO(record.getVeterinarian()))
                .dosage(record.getDosage())
                .applicationDate(record.getApplicationDate())
                .nextApplicationDate(record.getNextApplicationDate())
                .dewormingType(record.getDewormingType())
                .observations(record.getObservations())
                .isActive(record.getIsActive())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
