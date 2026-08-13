package com.veterinaria.backend.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateInventoryLotDTO {

    @NotBlank(message = "El número de lote es obligatorio")
    private String lotNumber;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    private LocalDate expirationDate;

    @NotNull(message = "La cantidad inicial del lote es obligatoria")
    @Min(value = 0, message = "La cantidad no puede ser negativa")
    private Integer quantity;

    private BigDecimal costPrice;
}
