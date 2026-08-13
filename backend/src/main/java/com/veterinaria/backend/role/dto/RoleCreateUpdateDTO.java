package com.veterinaria.backend.role.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleCreateUpdateDTO {
    @NotBlank(message = "Role name cannot be null")
    @Size(min = 3, max = 50, message = "Role name must have between 3 and 50 characters")
    private String name;

    @Size(max = 255, message = "Role description must be under 255 characters")
    private String description;

    private Set<UUID> permissionIds;
}
