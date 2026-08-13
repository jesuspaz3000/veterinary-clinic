package com.veterinaria.backend.sales.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryMovementDTO {
    private UUID id;
    private UUID variantId;
    private String productName;
    private String variantName;
    private String sku;
    private UUID lotId;
    private String lotNumber;
    private LocalDate lotExpirationDate;
    private String movementType;
    private BigDecimal quantity;
    private BigDecimal previousStock;
    private BigDecimal newStock;
    private String referenceType;
    private UUID referenceId;
    private String notes;
    private BigDecimal unitPrice;
    private UUID userId;
    private String userName;
    private Instant createdAt;
}
