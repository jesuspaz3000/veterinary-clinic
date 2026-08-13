package com.veterinaria.backend.pet.dto;

import com.veterinaria.backend.owner.dto.OwnerDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PetDTO {
    private UUID id;
    private OwnerDTO owner;
    private String name;
    private String species;
    private String breed;
    private String color;
    private String sex;
    private LocalDate birthDate;
    private String age;
    private BigDecimal weight;
    private String microchipNumber;
    private Boolean sterilized;
    private String photoUrl;
    private String status;
    private String specialNotes;
    private Instant createdAt;
    private Instant updatedAt;
}
