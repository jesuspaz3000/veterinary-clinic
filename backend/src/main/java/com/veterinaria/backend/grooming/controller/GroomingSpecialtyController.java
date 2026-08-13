package com.veterinaria.backend.grooming.controller;

import com.veterinaria.backend.grooming.dto.CreateGroomingSpecialtyDTO;
import com.veterinaria.backend.grooming.dto.GroomingSpecialtyDTO;
import com.veterinaria.backend.grooming.dto.UpdateGroomingSpecialtyDTO;
import com.veterinaria.backend.grooming.service.GroomingSpecialtyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/grooming-specialties")
@RequiredArgsConstructor
@Tag(name = "GroomingSpecialty", description = "Grooming specialties management")
@SecurityRequirement(name = "Bearer Authentication")
public class GroomingSpecialtyController {

    private final GroomingSpecialtyService specialtyService;

    @GetMapping
    @PreAuthorize("hasAuthority('GROOMING_READ') or hasAuthority('USERS_READ')")
    @Operation(summary = "Get all grooming specialties", description = "Get list of all grooming specialties")
    public ResponseEntity<List<GroomingSpecialtyDTO>> getAllSpecialties() {
        return ResponseEntity.ok(specialtyService.getAllSpecialties());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GROOMING_READ')")
    @Operation(summary = "Get grooming specialty by id", description = "Get grooming specialty member by id")
    public ResponseEntity<GroomingSpecialtyDTO> getSpecialtyById(@PathVariable UUID id) {
        return ResponseEntity.ok(specialtyService.getSpecialtyById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('GROOMING_CREATE') or hasAuthority('USERS_CREATE')")
    @Operation(summary = "Create grooming specialty", description = "Create new grooming specialty")
    public ResponseEntity<GroomingSpecialtyDTO> createSpecialty(@Valid @RequestBody CreateGroomingSpecialtyDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(specialtyService.createSpecialty(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GROOMING_UPDATE') or hasAuthority('USERS_UPDATE')")
    @Operation(summary = "Update grooming specialty", description = "Update existing grooming specialty")
    public ResponseEntity<GroomingSpecialtyDTO> updateSpecialty(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateGroomingSpecialtyDTO dto
    ) {
        return ResponseEntity.ok(specialtyService.updateSpecialty(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('GROOMING_DELETE') or hasAuthority('USERS_DELETE')")
    @Operation(summary = "Delete grooming specialty", description = "Delete grooming specialty if unused")
    public ResponseEntity<Void> deleteSpecialty(@PathVariable UUID id) {
        specialtyService.deleteSpecialty(id);
        return ResponseEntity.noContent().build();
    }
}
