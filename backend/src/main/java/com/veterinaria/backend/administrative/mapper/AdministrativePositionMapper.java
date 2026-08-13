package com.veterinaria.backend.administrative.mapper;

import com.veterinaria.backend.administrative.dto.AdministrativePositionDTO;
import com.veterinaria.backend.administrative.model.AdministrativePosition;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AdministrativePositionMapper {

    public AdministrativePositionDTO toDTO(AdministrativePosition position, long assignedCount, List<String> assignedStaffNames) {
        if (position == null) return null;

        return AdministrativePositionDTO.builder()
                .id(position.getId())
                .name(position.getName())
                .description(position.getDescription())
                .assignedCount(assignedCount)
                .assignedStaffNames(assignedStaffNames != null ? assignedStaffNames : List.of())
                .createdAt(position.getCreatedAt())
                .updatedAt(position.getUpdatedAt())
                .build();
    }
}
