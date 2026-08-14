package com.veterinaria.backend.sales.service;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.product.model.ProductVariant;
import com.veterinaria.backend.sales.dto.InventoryMovementDTO;
import com.veterinaria.backend.user.model.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface InventoryMovementService {
    PaginatedResponse<InventoryMovementDTO> getMovements(
            UUID variantId,
            UUID lotId,
            String movementType,
            Instant startDate,
            Instant endDate,
            int limit,
            int offset
    );

    /**
     * Descuenta stock de una variante siguiendo FEFO (primero el lote que vence antes),
     * decrementa el stock agregado de la variante y registra el movimiento de Kardex.
     * El llamador es responsable de haber obtenido {@code variant} con bloqueo pesimista
     * (ver {@code ProductVariantRepository#findByIdForUpdate}) para evitar sobreventa
     * bajo concurrencia, y de validar previamente que hay stock suficiente.
     *
     * @return el detalle de qué lote(s) se usaron y cuánto se descontó de cada uno
     */
    List<LotDeduction> consumeStock(ProductVariant variant, BigDecimal quantity, String movementType,
                                     String referenceType, UUID referenceId, String notes, User user);
}
