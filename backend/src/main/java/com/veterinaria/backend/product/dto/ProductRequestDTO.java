package com.veterinaria.backend.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequestDTO {
    private Integer limit;
    private Integer offset;
    private String search;
    private UUID categoryId;
    private UUID brandId;
    private String targetSpecies;
    private Boolean requiresPrescription;
    private Boolean isLowStock;
}
