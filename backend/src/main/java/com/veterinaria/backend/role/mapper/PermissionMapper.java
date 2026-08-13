package com.veterinaria.backend.role.mapper;

import com.veterinaria.backend.role.dto.PermissionDTO;
import com.veterinaria.backend.role.model.Permission;
import org.springframework.stereotype.Component;

@Component
public class PermissionMapper {
    public PermissionDTO toDTO(Permission permission){
        return PermissionDTO.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .module(permission.getModule())
                .action(permission.getAction())
                .labelEs(permission.getLabelEs())
                .descriptionEs(permission.getDescriptionEs())
                .isActive(permission.getIsActive())
                .createdAt(permission.getCreatedAt())
                .updatedAt(permission.getUpdatedAt())
                .build();
    }
}
