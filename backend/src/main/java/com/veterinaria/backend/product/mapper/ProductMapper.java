package com.veterinaria.backend.product.mapper;

import com.veterinaria.backend.common.storage.StorageService;
import com.veterinaria.backend.product.dto.ProductDTO;
import com.veterinaria.backend.product.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final CategoryMapper categoryMapper;
    private final BrandMapper brandMapper;
    private final ProductVariantMapper variantMapper;
    private final StorageService storageService;

    public ProductDTO toDTO(Product product) {
        if (product == null) return null;

        var variantDTOs = product.getVariants() != null
                ? product.getVariants().stream().map(variantMapper::toDTO).collect(Collectors.toList())
                : Collections.<com.veterinaria.backend.product.dto.ProductVariantDTO>emptyList();

        int totalStock = product.getVariants() != null
                ? product.getVariants().stream()
                    .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                    .mapToInt(v -> v.getStock() != null ? v.getStock() : 0)
                    .sum()
                : 0;

        return ProductDTO.builder()
                .id(product.getId())
                .category(categoryMapper.toDTO(product.getCategory()))
                .brand(brandMapper.toDTO(product.getBrand()))
                .name(product.getName())
                .activeIngredient(product.getActiveIngredient())
                .targetSpecies(product.getTargetSpecies())
                .description(product.getDescription())
                .requiresPrescription(product.getRequiresPrescription())
                .allowsFractioning(product.getAllowsFractioning())
                .imageUrl(storageService.resolveUrl(product.getImageUrl()))
                .isActive(product.getIsActive())
                .variants(variantDTOs)
                .totalStock(totalStock)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
