package com.veterinaria.backend.sales.service;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.sales.dto.InventoryMovementDTO;

import java.time.Instant;
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
}
