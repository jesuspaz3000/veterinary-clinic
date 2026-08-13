package com.veterinaria.backend.owner.dto;

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
public class OwnerDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String documentType;
    private String documentNumber;
    private String phone;
    private String email;
    private String address;
    private Boolean isActive;
    private long petsCount;
    private Instant createdAt;
    private Instant updatedAt;
}
