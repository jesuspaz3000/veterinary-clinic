package com.veterinaria.backend.specialty.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSpecialtyDTO {
    @NotBlank(message = "Specialty name cannot be blank")
    private String name;

    private String description;
}
