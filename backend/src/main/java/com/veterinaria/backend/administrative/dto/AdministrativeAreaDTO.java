package com.veterinaria.backend.administrative.dto;

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
public class AdministrativeAreaDTO {
    private UUID id;
    private String name;
    private String description;
    private long assignedCount;
    private List<String> assignedStaffNames;
    private Instant createdAt;
    private Instant updatedAt;
}
