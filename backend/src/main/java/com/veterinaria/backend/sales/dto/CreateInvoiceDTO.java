package com.veterinaria.backend.sales.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInvoiceDTO {

    private String series; // Opcional, por defecto "B001" (boleta), "F001" (factura), "T001" (ticket)

    private String invoiceType; // boleta, factura, ticket (defecto: boleta)

    private UUID ownerId; // Opcional (nulo si es Venta Mostrador)

    private UUID appointmentId; // Opcional

    private UUID veterinarianId; // Opcional (médico referente)

    private BigDecimal globalDiscount; // Opcional

    private String notes;

    @NotEmpty(message = "Debe incluir al menos un ítem en la venta.")
    @Valid
    private List<CreateInvoiceItemDTO> items;

    @NotEmpty(message = "Debe registrar al menos un pago.")
    @Valid
    private List<CreateInvoicePaymentDTO> payments;
}
