package com.veterinaria.backend.specialty.controller;

import com.veterinaria.backend.specialty.dto.CreateSpecialtyDTO;
import com.veterinaria.backend.specialty.dto.SpecialtyDTO;
import com.veterinaria.backend.specialty.dto.UpdateSpecialtyDTO;
import com.veterinaria.backend.specialty.service.SpecialtyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/specialties")
@RequiredArgsConstructor
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    @GetMapping
    @PreAuthorize("hasAuthority('VETERINARIANS_READ') or hasAuthority('USERS_READ')")
    public ResponseEntity<List<SpecialtyDTO>> getAllSpecialties() {
        return ResponseEntity.ok(specialtyService.getAllSpecialties());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VETERINARIANS_READ')")
    public ResponseEntity<SpecialtyDTO> getSpecialtyById(@PathVariable UUID id) {
        return ResponseEntity.ok(specialtyService.getSpecialtyById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('VETERINARIANS_CREATE') or hasAuthority('USERS_CREATE')")
    public ResponseEntity<SpecialtyDTO> createSpecialty(@Valid @RequestBody CreateSpecialtyDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(specialtyService.createSpecialty(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('VETERINARIANS_UPDATE') or hasAuthority('USERS_UPDATE')")
    public ResponseEntity<SpecialtyDTO> updateSpecialty(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSpecialtyDTO dto
    ) {
        return ResponseEntity.ok(specialtyService.updateSpecialty(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('VETERINARIANS_DELETE') or hasAuthority('USERS_DELETE')")
    public ResponseEntity<Void> deleteSpecialty(@PathVariable UUID id) {
        specialtyService.deleteSpecialty(id);
        return ResponseEntity.noContent().build();
    }
}
