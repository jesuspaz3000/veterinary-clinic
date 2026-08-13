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
public class CreateCreditNoteItemDTO {

    @NotNull(message = "El ID del ítem de factura es obligatorio.")
    private UUID invoiceItemId;

    @NotNull(message = "La cantidad a devolver es obligatoria.")
    @DecimalMin(value = "0.001", message = "La cantidad devuelta debe ser mayor a 0.")
    private BigDecimal quantity;
}
