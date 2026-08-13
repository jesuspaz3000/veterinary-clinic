package com.veterinaria.backend.product.mapper;

import com.veterinaria.backend.product.dto.InventoryLotDTO;
import com.veterinaria.backend.product.model.InventoryLot;
import org.springframework.stereotype.Component;

@Component
public class InventoryLotMapper {

    public InventoryLotDTO toDTO(InventoryLot lot) {
        if (lot == null) return null;

        return InventoryLotDTO.builder()
                .id(lot.getId())
                .variantId(lot.getVariant() != null ? lot.getVariant().getId() : null)
                .lotNumber(lot.getLotNumber())
                .expirationDate(lot.getExpirationDate())
                .quantity(lot.getQuantity())
                .costPrice(lot.getCostPrice())
                .status(lot.getStatus())
                .createdAt(lot.getCreatedAt())
                .updatedAt(lot.getUpdatedAt())
                .build();
    }
}
