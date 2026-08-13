package com.veterinaria.backend.sales.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCreditNoteDTO {

    @NotNull(message = "El ID de la factura original es obligatorio.")
    private UUID invoiceId;

    private String series; // Defecto "NC01"

    @NotBlank(message = "El motivo de la nota de crédito es obligatorio.")
    private String reason; // devolucion, error_emision, descuento_post_venta

    @Builder.Default
    private Boolean restockInventory = true;

    @NotEmpty(message = "Debe incluir al menos un ítem a devolver.")
    @Valid
    private List<CreateCreditNoteItemDTO> items;
}
