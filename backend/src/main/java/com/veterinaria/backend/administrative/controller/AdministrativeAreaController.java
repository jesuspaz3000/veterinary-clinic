package com.veterinaria.backend.administrative.controller;

import com.veterinaria.backend.administrative.dto.AdministrativeAreaDTO;
import com.veterinaria.backend.administrative.dto.CreateAdministrativeAreaDTO;
import com.veterinaria.backend.administrative.dto.UpdateAdministrativeAreaDTO;
import com.veterinaria.backend.administrative.service.AdministrativeAreaService;
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
@RequestMapping("/administrative-areas")
@RequiredArgsConstructor
@Tag(name = "AdministrativeAreas", description = "Administrative areas catalog management")
@SecurityRequirement(name = "Bearer Authentication")
public class AdministrativeAreaController {

    private final AdministrativeAreaService areaService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_READ') or hasAuthority('USERS_READ')")
    @Operation(summary = "Get all administrative areas", description = "Get all administrative areas")
    public ResponseEntity<List<AdministrativeAreaDTO>> getAllAreas() {
        return ResponseEntity.ok(areaService.getAllAreas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_READ')")
    @Operation(summary = "Get area by id", description = "Get area by id")
    public ResponseEntity<AdministrativeAreaDTO> getAreaById(@PathVariable UUID id) {
        return ResponseEntity.ok(areaService.getAreaById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_CREATE') or hasAuthority('USERS_CREATE')")
    @Operation(summary = "Create area", description = "Create administrative area")
    public ResponseEntity<AdministrativeAreaDTO> createArea(@Valid @RequestBody CreateAdministrativeAreaDTO dto) {
        return ResponseEntity.ok(areaService.createArea(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_UPDATE') or hasAuthority('USERS_UPDATE')")
    @Operation(summary = "Update area", description = "Update administrative area")
    public ResponseEntity<AdministrativeAreaDTO> updateArea(@PathVariable UUID id, @Valid @RequestBody UpdateAdministrativeAreaDTO dto) {
        return ResponseEntity.ok(areaService.updateArea(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_DELETE') or hasAuthority('USERS_DELETE')")
    @Operation(summary = "Delete area", description = "Delete administrative area if not assigned to any staff")
    public ResponseEntity<MessageResponse> deleteArea(@PathVariable UUID id) {
        areaService.deleteArea(id);
        return ResponseEntity.ok(new MessageResponse("Área administrativa eliminada exitosamente"));
    }
}
