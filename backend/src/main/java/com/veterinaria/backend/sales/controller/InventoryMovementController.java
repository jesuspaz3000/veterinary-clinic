package com.veterinaria.backend.sales.controller;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.sales.dto.InventoryMovementDTO;
import com.veterinaria.backend.sales.service.InventoryMovementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/inventory/movements")
@RequiredArgsConstructor
@Tag(name = "Inventory Kardex", description = "Endpoints for inventory movement history and Kardex auditing")
@SecurityRequirement(name = "Bearer Authentication")
public class InventoryMovementController {

    private final InventoryMovementService movementService;

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCTS_READ') or hasAuthority('SALES_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get Kardex movements paginated", description = "Get list of inventory movements for audit")
    public ResponseEntity<PaginatedResponse<InventoryMovementDTO>> getMovements(
            @RequestParam(required = false) UUID variantId,
            @RequestParam(required = false) UUID lotId,
            @RequestParam(required = false) String movementType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        return ResponseEntity.ok(movementService.getMovements(variantId, lotId, movementType, startDate, endDate, limit, offset));
    }
}
