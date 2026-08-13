package com.veterinaria.backend.product.dto;

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
public class ProductDTO {
    private UUID id;
    private CategoryDTO category;
    private BrandDTO brand;
    private String name;
    private String activeIngredient;
    private String targetSpecies;
    private String description;
    private Boolean requiresPrescription;
    private Boolean allowsFractioning;
    private String imageUrl;
    private Boolean isActive;
    private List<ProductVariantDTO> variants;
    private Integer totalStock;
    private Instant createdAt;
    private Instant updatedAt;
}
