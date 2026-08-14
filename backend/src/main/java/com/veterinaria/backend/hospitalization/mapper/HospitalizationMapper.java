package com.veterinaria.backend.hospitalization.mapper;

import com.veterinaria.backend.hospitalization.dto.HospitalizationEvolutionDTO;
import com.veterinaria.backend.hospitalization.dto.HospitalizationRecordDTO;
import com.veterinaria.backend.hospitalization.model.HospitalizationEvolution;
import com.veterinaria.backend.hospitalization.model.HospitalizationRecord;
import com.veterinaria.backend.pet.mapper.PetMapper;
import com.veterinaria.backend.veterinarian.mapper.VeterinarianMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HospitalizationMapper {

    private final PetMapper petMapper;
    private final VeterinarianMapper veterinarianMapper;

    public HospitalizationRecordDTO toDTO(HospitalizationRecord record) {
        if (record == null) return null;

        return HospitalizationRecordDTO.builder()
                .id(record.getId())
                .pet(petMapper.toDTO(record.getPet()))
                .medicalRecordId(record.getMedicalRecord().getId())
                .admissionDate(record.getAdmissionDate())
                .dischargeDate(record.getDischargeDate())
                .reason(record.getReason())
                .cageNumber(record.getCageNumber())
                .veterinarian(veterinarianMapper.toDTO(record.getVeterinarian()))
                .status(record.getStatus())
                .finalDiagnosis(record.getFinalDiagnosis())
                .dischargeNotes(record.getDischargeNotes())
                .evolutions(record.getEvolutions().stream().map(this::toDTO).toList())
                .isActive(record.getIsActive())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }

    public HospitalizationEvolutionDTO toDTO(HospitalizationEvolution evolution) {
        if (evolution == null) return null;

        return HospitalizationEvolutionDTO.builder()
                .id(evolution.getId())
                .evolutionDate(evolution.getEvolutionDate())
                .veterinarian(veterinarianMapper.toDTO(evolution.getVeterinarian()))
                .weight(evolution.getWeight())
                .temperature(evolution.getTemperature())
                .heartRate(evolution.getHeartRate())
                .respiratoryRate(evolution.getRespiratoryRate())
                .foodIntake(evolution.getFoodIntake())
                .waterIntake(evolution.getWaterIntake())
                .urination(evolution.getUrination())
                .defecation(evolution.getDefecation())
                .activityLevel(evolution.getActivityLevel())
                .medicationAdministered(evolution.getMedicationAdministered())
                .proceduresPerformed(evolution.getProceduresPerformed())
                .observations(evolution.getObservations())
                .createdAt(evolution.getCreatedAt())
                .build();
    }
}
