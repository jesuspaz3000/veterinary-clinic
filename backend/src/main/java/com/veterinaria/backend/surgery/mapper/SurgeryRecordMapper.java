package com.veterinaria.backend.surgery.mapper;

import com.veterinaria.backend.pet.mapper.PetMapper;
import com.veterinaria.backend.surgery.dto.SurgeryRecordDTO;
import com.veterinaria.backend.surgery.model.SurgeryRecord;
import com.veterinaria.backend.veterinarian.mapper.VeterinarianMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SurgeryRecordMapper {

    private final PetMapper petMapper;
    private final VeterinarianMapper veterinarianMapper;

    public SurgeryRecordDTO toDTO(SurgeryRecord record) {
        if (record == null) return null;

        return SurgeryRecordDTO.builder()
                .id(record.getId())
                .pet(petMapper.toDTO(record.getPet()))
                .medicalRecordId(record.getMedicalRecord().getId())
                .surgeryType(record.getSurgeryType())
                .surgeryDate(record.getSurgeryDate())
                .veterinarian(veterinarianMapper.toDTO(record.getVeterinarian()))
                .assistantVeterinarian(veterinarianMapper.toDTO(record.getAssistantVeterinarian()))
                .anesthesiaType(record.getAnesthesiaType())
                .durationMinutes(record.getDurationMinutes())
                .preSurgeryNotes(record.getPreSurgeryNotes())
                .surgeryNotes(record.getSurgeryNotes())
                .postSurgeryNotes(record.getPostSurgeryNotes())
                .complications(record.getComplications())
                .status(record.getStatus())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
