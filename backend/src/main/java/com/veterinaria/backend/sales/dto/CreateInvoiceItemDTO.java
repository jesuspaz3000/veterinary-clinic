package com.veterinaria.backend.sales.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInvoiceItemDTO {

    private UUID variantId; // Requerido si es producto

    private String serviceName; // Requerido si es servicio

    private UUID prescriptionId; // Opcional para trazabilidad médica

    private String description; // Opcional, si viene vacía se usa el nombre de la variante/servicio

    @NotNull(message = "La cantidad del ítem es obligatoria.")
    @DecimalMin(value = "0.001", message = "La cantidad debe ser mayor a 0.")
    private BigDecimal quantity;

    @NotNull(message = "El precio unitario es obligatorio.")
    @DecimalMin(value = "0.00", message = "El precio unitario no puede ser negativo.")
    private BigDecimal unitPrice;

    private BigDecimal discount;
}
