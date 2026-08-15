package com.veterinaria.backend.sales.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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

    private String customerName; // Opcional: nombre libre del cliente no registrado (solo si ownerId es nulo)

    private UUID appointmentId; // Opcional

    private UUID veterinarianId; // Opcional (médico referente)

    private BigDecimal globalDiscount; // Opcional

    private String notes;

    @NotEmpty(message = "Debe incluir al menos un ítem en la venta.")
    @Valid
    private List<CreateInvoiceItemDTO> items;

    // Puede venir vacía: una venta "al crédito" se registra sin pagos y queda "pendiente".
    @NotNull(message = "La lista de pagos es obligatoria (puede ir vacía para una venta al crédito).")
    @Valid
    private List<CreateInvoicePaymentDTO> payments;
}
