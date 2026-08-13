package com.veterinaria.backend.sales.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditNoteDTO {
    private UUID id;
    private UUID invoiceId;
    private String invoiceNumber;
    private String series;
    private Integer correlative;
    private String creditNoteNumber;
    private String reason;
    private BigDecimal total;
    private Boolean restockInventory;
    private UUID userId;
    private String userName;
    private Instant issuedAt;
    private Instant createdAt;
    private List<CreditNoteItemDTO> items;
}
