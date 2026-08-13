package com.veterinaria.backend.role.mapper;

import com.veterinaria.backend.role.dto.PermissionDTO;
import com.veterinaria.backend.role.dto.RoleDTO;
import com.veterinaria.backend.role.model.Role;
import com.veterinaria.backend.role.mapper.PermissionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RoleMapper {
    private final PermissionMapper permissionMapper;

    public RoleDTO toDTO(Role role){
        Set<PermissionDTO> permissionDTOS = role.getPermissions()
                .stream()
                .map(permissionMapper::toDTO)
                .collect(Collectors.toSet());

        return RoleDTO.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .permissions(permissionDTOS)
                .permissionsCount(permissionDTOS.size())
                .isActive(role.getIsActive())
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }
}
