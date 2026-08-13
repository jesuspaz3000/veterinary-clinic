package com.veterinaria.backend.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InventoryLotDTO {
    private UUID id;
    private UUID variantId;
    private String lotNumber;
    private LocalDate expirationDate;
    private Integer quantity;
    private BigDecimal costPrice;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
