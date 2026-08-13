package com.veterinaria.backend.grooming.mapper;

import com.veterinaria.backend.grooming.dto.GroomingSpecialtyDTO;
import com.veterinaria.backend.grooming.model.GroomingSpecialty;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GroomingSpecialtyMapper {

    public GroomingSpecialtyDTO toDTO(GroomingSpecialty specialty, long count, List<String> assignedNames) {
        if (specialty == null) return null;

        return GroomingSpecialtyDTO.builder()
                .id(specialty.getId())
                .name(specialty.getName())
                .description(specialty.getDescription())
                .assignedCount(count)
                .assignedStaffNames(assignedNames != null ? assignedNames : List.of())
                .createdAt(specialty.getCreatedAt())
                .updatedAt(specialty.getUpdatedAt())
                .build();
    }
}
