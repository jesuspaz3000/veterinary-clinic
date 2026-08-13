package com.veterinaria.backend.administrative.dto;

import com.veterinaria.backend.user.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdministrativeStaffDTO {
    private UUID id;
    private UserDTO user;
    private java.util.Set<AdministrativePositionDTO> positions;
    private AdministrativeAreaDTO assignedArea;
    private Instant createdAt;
    private Instant updatedAt;
}
