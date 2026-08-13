package com.veterinaria.backend.administrative.mapper;

import com.veterinaria.backend.administrative.dto.AdministrativeAreaDTO;
import com.veterinaria.backend.administrative.model.AdministrativeArea;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AdministrativeAreaMapper {

    public AdministrativeAreaDTO toDTO(AdministrativeArea area, long assignedCount, List<String> assignedStaffNames) {
        if (area == null) return null;

        return AdministrativeAreaDTO.builder()
                .id(area.getId())
                .name(area.getName())
                .description(area.getDescription())
                .assignedCount(assignedCount)
                .assignedStaffNames(assignedStaffNames != null ? assignedStaffNames : List.of())
                .createdAt(area.getCreatedAt())
                .updatedAt(area.getUpdatedAt())
                .build();
    }
}
