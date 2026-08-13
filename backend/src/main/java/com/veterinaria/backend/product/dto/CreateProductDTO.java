package com.veterinaria.backend.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateProductDTO {

    @NotNull(message = "La categoría es obligatoria")
    private UUID categoryId;

    private UUID brandId;

    @NotBlank(message = "El nombre del producto es obligatorio")
    private String name;

    private String activeIngredient;
    private String targetSpecies;
    private String description;

    @Builder.Default
    private Boolean requiresPrescription = false;

    @Builder.Default
    private Boolean allowsFractioning = false;

    private MultipartFile image;

    @NotEmpty(message = "Debe incluir al menos una presentación/variante")
    private List<CreateProductVariantDTO> variants;
}
