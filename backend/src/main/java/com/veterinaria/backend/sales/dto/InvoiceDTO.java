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
public class InvoiceDTO {
    private UUID id;
    private String series;
    private Integer correlative;
    private String invoiceNumber;
    private String invoiceType;
    private UUID ownerId;
    private String ownerName;
    private String ownerDocumentNumber;
    private UUID appointmentId;
    private UUID veterinarianId;
    private String veterinarianName;
    private String paymentStatus;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal total;
    private String notes;
    private UUID userId;
    private String userName;
    private Instant issuedAt;
    private Instant createdAt;
    private List<InvoiceItemDTO> items;
    private List<InvoicePaymentDTO> payments;
}
