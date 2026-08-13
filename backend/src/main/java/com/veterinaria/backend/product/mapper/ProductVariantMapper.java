package com.veterinaria.backend.product.mapper;

import com.veterinaria.backend.product.dto.ProductVariantDTO;
import com.veterinaria.backend.product.model.ProductVariant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductVariantMapper {

    private final InventoryLotMapper lotMapper;

    public ProductVariantDTO toDTO(ProductVariant variant) {
        if (variant == null) return null;

        var lotDTOs = variant.getLots() != null
                ? variant.getLots().stream().map(lotMapper::toDTO).collect(Collectors.toList())
                : Collections.<com.veterinaria.backend.product.dto.InventoryLotDTO>emptyList();

        return ProductVariantDTO.builder()
                .id(variant.getId())
                .productId(variant.getProduct() != null ? variant.getProduct().getId() : null)
                .sku(variant.getSku())
                .barcode(variant.getBarcode())
                .name(variant.getName())
                .salePrice(variant.getSalePrice())
                .costPrice(variant.getCostPrice())
                .stock(variant.getStock())
                .minStock(variant.getMinStock())
                .unitMeasure(variant.getUnitMeasure())
                .weightOrVolume(variant.getWeightOrVolume())
                .isActive(variant.getIsActive())
                .lots(lotDTOs)
                .createdAt(variant.getCreatedAt())
                .updatedAt(variant.getUpdatedAt())
                .build();
    }
}
