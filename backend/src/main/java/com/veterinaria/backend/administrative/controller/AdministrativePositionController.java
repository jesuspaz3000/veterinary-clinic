package com.veterinaria.backend.administrative.controller;

import com.veterinaria.backend.administrative.dto.AdministrativePositionDTO;
import com.veterinaria.backend.administrative.dto.CreateAdministrativePositionDTO;
import com.veterinaria.backend.administrative.dto.UpdateAdministrativePositionDTO;
import com.veterinaria.backend.administrative.service.AdministrativePositionService;
import com.veterinaria.backend.common.dto.MessageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/administrative-positions")
@RequiredArgsConstructor
@Tag(name = "AdministrativePositions", description = "Administrative positions catalog management")
@SecurityRequirement(name = "Bearer Authentication")
public class AdministrativePositionController {

    private final AdministrativePositionService positionService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_READ') or hasAuthority('USERS_READ')")
    @Operation(summary = "Get all administrative positions", description = "Get all administrative positions")
    public ResponseEntity<List<AdministrativePositionDTO>> getAllPositions() {
        return ResponseEntity.ok(positionService.getAllPositions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_READ')")
    @Operation(summary = "Get position by id", description = "Get position by id")
    public ResponseEntity<AdministrativePositionDTO> getPositionById(@PathVariable UUID id) {
        return ResponseEntity.ok(positionService.getPositionById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_CREATE') or hasAuthority('USERS_CREATE')")
    @Operation(summary = "Create position", description = "Create administrative position")
    public ResponseEntity<AdministrativePositionDTO> createPosition(@Valid @RequestBody CreateAdministrativePositionDTO dto) {
        return ResponseEntity.ok(positionService.createPosition(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_UPDATE') or hasAuthority('USERS_UPDATE')")
    @Operation(summary = "Update position", description = "Update administrative position")
    public ResponseEntity<AdministrativePositionDTO> updatePosition(@PathVariable UUID id, @Valid @RequestBody UpdateAdministrativePositionDTO dto) {
        return ResponseEntity.ok(positionService.updatePosition(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_DELETE') or hasAuthority('USERS_DELETE')")
    @Operation(summary = "Delete position", description = "Delete administrative position if not assigned to any staff")
    public ResponseEntity<MessageResponse> deletePosition(@PathVariable UUID id) {
        positionService.deletePosition(id);
        return ResponseEntity.ok(new MessageResponse("Cargo administrativo eliminado exitosamente"));
    }
}
