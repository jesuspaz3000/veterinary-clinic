package com.veterinaria.backend.veterinarian.dto;

import com.veterinaria.backend.specialty.dto.SpecialtyDTO;
import com.veterinaria.backend.user.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VeterinarianDTO {
    private UUID id;
    private UserDTO user;
    private String licenseNumber;
    @Builder.Default
    private Set<SpecialtyDTO> specialties = new HashSet<>();
    private LocalDate hireDate;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}