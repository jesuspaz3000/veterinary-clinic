package com.veterinaria.backend.product.mapper;

import com.veterinaria.backend.product.dto.BrandDTO;
import com.veterinaria.backend.product.model.Brand;
import org.springframework.stereotype.Component;

@Component
public class BrandMapper {

    public BrandDTO toDTO(Brand brand) {
        if (brand == null) return null;

        return BrandDTO.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .createdAt(brand.getCreatedAt())
                .updatedAt(brand.getUpdatedAt())
                .build();
    }
}
