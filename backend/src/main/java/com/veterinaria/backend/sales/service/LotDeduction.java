package com.veterinaria.backend.sales.service;

import com.veterinaria.backend.product.model.InventoryLot;

import java.math.BigDecimal;

/** Resultado de descontar stock de un lote puntual dentro de una operación FEFO. */
public record LotDeduction(InventoryLot lot, BigDecimal quantityDeducted) {
}
