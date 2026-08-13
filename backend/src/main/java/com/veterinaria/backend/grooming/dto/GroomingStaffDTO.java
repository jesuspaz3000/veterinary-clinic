package com.veterinaria.backend.grooming.dto;

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
public class GroomingStaffDTO {
    private UUID id;
    private UserDTO user;

    @Builder.Default
    private Set<GroomingSpecialtyDTO> specialties = new HashSet<>();

    private Integer experienceYears;
    private LocalDate hireDate;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
