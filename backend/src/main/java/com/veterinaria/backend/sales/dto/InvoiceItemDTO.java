package com.veterinaria.backend.sales.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItemDTO {
    private UUID id;
    private UUID variantId;
    private String productName;
    private String variantName;
    private String sku;
    private String unitMeasure;
    private UUID prescriptionId;
    private String serviceName;
    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal discount;
    private BigDecimal subtotal;
    private List<InvoiceItemLotDTO> itemLots;
}
