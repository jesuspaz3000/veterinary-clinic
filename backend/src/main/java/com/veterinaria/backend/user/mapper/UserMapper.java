package com.veterinaria.backend.user.mapper;

import com.veterinaria.backend.common.storage.StorageService;
import com.veterinaria.backend.role.model.Permission;
import com.veterinaria.backend.role.model.Role;
import com.veterinaria.backend.user.dto.UserDTO;
import com.veterinaria.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final StorageService storageService;

    public UserDTO toDTO(User user) {
        Role role = user.getRole();
        List<String> permissions = role != null
                ? role.getPermissions().stream().map(Permission::getName).toList()
                : null;
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(role != null ? role.getName() : null)
                .permissions(permissions)
                .permissionsCount(permissions != null ? permissions.size() : null)
                .avatarUrl(storageService.resolveUrl(user.getAvatarUrl()))
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
