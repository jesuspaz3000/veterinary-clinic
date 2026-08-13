package com.veterinaria.backend.sales.dto;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceRequestDTO {
    private String search;
    private String series;
    private String invoiceType;
    private String paymentStatus;
    private UUID ownerId;
    private Instant startDate;
    private Instant endDate;
    @Builder.Default
    private int limit = 10;
    @Builder.Default
    private int offset = 0;
}
