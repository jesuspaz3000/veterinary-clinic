package com.veterinaria.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private UUID id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private List<String> permissions;
    private Integer permissionsCount;
    private String avatarUrl;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
