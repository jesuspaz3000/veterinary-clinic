package com.veterinaria.backend.specialty.dto;

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
public class SpecialtyDTO {
    private UUID id;
    private String name;
    private String description;
    private long veterinariansCount;
    private List<String> assignedVeterinarians;
    private Instant createdAt;
    private Instant updatedAt;
}
