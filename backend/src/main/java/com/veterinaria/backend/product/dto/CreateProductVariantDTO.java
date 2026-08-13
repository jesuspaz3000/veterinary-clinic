package com.veterinaria.backend.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateProductVariantDTO {

    private UUID id;
    private String sku;
    private String barcode;

    @NotBlank(message = "El nombre de la presentación/variante es obligatorio")
    private String name;

    @NotNull(message = "El precio de venta es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio de venta debe ser mayor o igual a 0")
    private BigDecimal salePrice;

    @NotNull(message = "El precio de costo es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio de costo debe ser mayor o igual a 0")
    private BigDecimal costPrice;

    @NotNull(message = "El stock inicial es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    private Integer minStock;

    @NotBlank(message = "La unidad de medida es obligatoria")
    private String unitMeasure;

    private BigDecimal weightOrVolume;

    private List<CreateInventoryLotDTO> lots;
}
