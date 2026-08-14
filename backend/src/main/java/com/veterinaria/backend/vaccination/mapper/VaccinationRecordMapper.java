package com.veterinaria.backend.vaccination.mapper;

import com.veterinaria.backend.pet.mapper.PetMapper;
import com.veterinaria.backend.vaccination.dto.VaccinationRecordDTO;
import com.veterinaria.backend.vaccination.model.VaccinationRecord;
import com.veterinaria.backend.veterinarian.mapper.VeterinarianMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VaccinationRecordMapper {

    private final PetMapper petMapper;
    private final VeterinarianMapper veterinarianMapper;

    public VaccinationRecordDTO toDTO(VaccinationRecord record) {
        if (record == null) return null;

        return VaccinationRecordDTO.builder()
                .id(record.getId())
                .pet(petMapper.toDTO(record.getPet()))
                .medicalRecordId(record.getMedicalRecord() != null ? record.getMedicalRecord().getId() : null)
                .productId(record.getProduct().getId())
                .productName(record.getProduct().getName())
                .veterinarian(veterinarianMapper.toDTO(record.getVeterinarian()))
                .vaccineName(record.getVaccineName())
                .vaccineBrand(record.getVaccineBrand())
                .batchNumber(record.getBatchNumber())
                .applicationDate(record.getApplicationDate())
                .nextDoseDate(record.getNextDoseDate())
                .observations(record.getObservations())
                .isActive(record.getIsActive())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
