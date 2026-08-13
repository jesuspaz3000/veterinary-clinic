package com.veterinaria.backend.sales.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoicePaymentDTO {
    private UUID id;
    private String paymentMethod;
    private BigDecimal amount;
    private String referenceNumber;
    private Instant createdAt;
}
