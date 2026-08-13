package com.veterinaria.backend.specialty.mapper;

import com.veterinaria.backend.specialty.dto.SpecialtyDTO;
import com.veterinaria.backend.specialty.model.Specialty;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SpecialtyMapper {

    public SpecialtyDTO toDTO(Specialty specialty, long count, List<String> assignedNames) {
        if (specialty == null) return null;

        return SpecialtyDTO.builder()
                .id(specialty.getId())
                .name(specialty.getName())
                .description(specialty.getDescription())
                .veterinariansCount(count)
                .assignedVeterinarians(assignedNames != null ? assignedNames : List.of())
                .createdAt(specialty.getCreatedAt())
                .updatedAt(specialty.getUpdatedAt())
                .build();
    }
}
