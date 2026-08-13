package com.veterinaria.backend.sales.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItemLotDTO {
    private UUID id;
    private UUID lotId;
    private String lotNumber;
    private LocalDate expirationDate;
    private BigDecimal quantity;
}
