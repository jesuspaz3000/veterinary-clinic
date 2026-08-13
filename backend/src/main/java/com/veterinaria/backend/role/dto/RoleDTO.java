package com.veterinaria.backend.role.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {
    private UUID id;
    private String name;
    private String description;
    private Set<PermissionDTO> permissions;
    private Integer permissionsCount;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
