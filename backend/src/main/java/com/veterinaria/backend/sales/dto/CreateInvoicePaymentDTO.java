package com.veterinaria.backend.sales.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInvoicePaymentDTO {

    @NotBlank(message = "El método de pago es obligatorio.")
    private String paymentMethod; // efectivo, tarjeta, yape_plin, transferencia, credito

    @NotNull(message = "El monto del pago es obligatorio.")
    @DecimalMin(value = "0.01", message = "El monto de pago debe ser mayor a 0.")
    private BigDecimal amount;

    private String referenceNumber;
}
