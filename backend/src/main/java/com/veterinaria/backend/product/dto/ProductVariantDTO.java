package com.veterinaria.backend.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantDTO {
    private UUID id;
    private UUID productId;
    private String sku;
    private String barcode;
    private String name;
    private BigDecimal salePrice;
    private BigDecimal costPrice;
    private Integer stock;
    private Integer minStock;
    private String unitMeasure;
    private BigDecimal weightOrVolume;
    private Boolean isActive;
    private List<InventoryLotDTO> lots;
    private Instant createdAt;
    private Instant updatedAt;
}
