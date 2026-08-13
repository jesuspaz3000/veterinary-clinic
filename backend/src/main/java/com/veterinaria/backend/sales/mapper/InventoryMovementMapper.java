package com.veterinaria.backend.sales.mapper;

import com.veterinaria.backend.sales.dto.InventoryMovementDTO;
import com.veterinaria.backend.sales.model.InventoryMovement;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
public class InventoryMovementMapper {

    public InventoryMovementDTO toDTO(InventoryMovement movement) {
        if (movement == null) return null;

        String productName = null;
        String variantName = null;
        String sku = null;
        if (movement.getVariant() != null) {
            variantName = movement.getVariant().getName();
            sku = movement.getVariant().getSku();
            if (movement.getVariant().getProduct() != null) {
                productName = movement.getVariant().getProduct().getName();
            }
        }

        UUID lotId = null;
        String lotNumber = null;
        LocalDate lotExpiration = null;
        if (movement.getLot() != null) {
            lotId = movement.getLot().getId();
            lotNumber = movement.getLot().getLotNumber();
            lotExpiration = movement.getLot().getExpirationDate();
        }

        String userName = null;
        if (movement.getUser() != null) {
            String fn = movement.getUser().getFirstName() != null ? movement.getUser().getFirstName().trim() : "";
            String ln = movement.getUser().getLastName() != null ? movement.getUser().getLastName().trim() : "";
            String fullName = (fn + " " + ln).trim();
            userName = !fullName.isEmpty() ? fullName : movement.getUser().getUsername();
        }

        return InventoryMovementDTO.builder()
                .id(movement.getId())
                .variantId(movement.getVariant() != null ? movement.getVariant().getId() : null)
                .productName(productName)
                .variantName(variantName)
                .sku(sku)
                .lotId(lotId)
                .lotNumber(lotNumber)
                .lotExpirationDate(lotExpiration)
                .movementType(movement.getMovementType())
                .quantity(movement.getQuantity())
                .previousStock(movement.getPreviousStock())
                .newStock(movement.getNewStock())
                .referenceType(movement.getReferenceType())
                .referenceId(movement.getReferenceId())
                .notes(movement.getNotes())
                .unitPrice(movement.getVariant() != null ? movement.getVariant().getSalePrice() : null)
                .userId(movement.getUser() != null ? movement.getUser().getId() : null)
                .userName(userName)
                .createdAt(movement.getCreatedAt())
                .build();
    }
}
