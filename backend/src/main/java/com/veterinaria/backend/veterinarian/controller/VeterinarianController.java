package com.veterinaria.backend.veterinarian.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.util.PaginationValidator;
import com.veterinaria.backend.veterinarian.dto.CreateVeterinarianDTO;
import com.veterinaria.backend.veterinarian.dto.UpdateVeterinarianDTO;
import com.veterinaria.backend.veterinarian.dto.VeterinarianDTO;
import com.veterinaria.backend.veterinarian.service.VeterinarianService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/veterinarians")
@RequiredArgsConstructor
@Tag(name = "Veterinarians", description = "Veterinarian management")
@SecurityRequirement(name = "Bearer Authentication")
public class VeterinarianController {
    private final VeterinarianService veterinarianService;

    @GetMapping
    @PreAuthorize("hasAuthority('VETERINARIANS_READ')")
    @Operation(summary = "Get all veterinarians", description = "Get all veterinarians")
    public ResponseEntity<PaginatedResponse<VeterinarianDTO>> getAllVeterinarians(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) String search,
            HttpServletRequest request
    ) {
        if (limit != null) {
            int effectiveOffset = offset != null ? offset : 0;
            Pageable pageable = PaginationValidator.getPageable(limit, effectiveOffset, Sort.by("createdAt").descending());
            Page<VeterinarianDTO> vetsPage = veterinarianService.getAllVeterinariansPaginated(search, pageable);
            PaginatedResponse<VeterinarianDTO> response = PaginationValidator.buildPaginatedResponse(
                    vetsPage,
                    limit,
                    effectiveOffset,
                    request.getRequestURI(),
                    request.getQueryString()
            );
            return ResponseEntity.ok(response);
        } else {
            List<VeterinarianDTO> vets = veterinarianService.getAllVeterinarians(search);
            PaginatedResponse<VeterinarianDTO> response = PaginatedResponse.<VeterinarianDTO>builder()
                    .count((long) vets.size())
                    .next(null)
                    .previous(null)
                    .results(new ArrayList<>(vets))
                    .build();
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VETERINARIANS_READ')")
    @Operation(summary = "Get veterinarian by id", description = "Get veterinarian by id")
    public ResponseEntity<VeterinarianDTO> getVeterinarianById(@PathVariable UUID id) {
        return ResponseEntity.ok(veterinarianService.getVeterinarianById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('VETERINARIANS_CREATE')")
    @Operation(summary = "Create veterinarian", description = "Create veterinarian")
    public ResponseEntity<VeterinarianDTO> createVeterinarian(@Valid @ModelAttribute CreateVeterinarianDTO dto) {
        return ResponseEntity.ok(veterinarianService.createVeterinarian(dto));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('VETERINARIANS_UPDATE')")
    @Operation(summary = "Update veterinarian", description = "Update veterinarian")
    public ResponseEntity<VeterinarianDTO> updateVeterinarian(
            @PathVariable UUID id,
            @Valid @ModelAttribute UpdateVeterinarianDTO dto
    ) {
        return ResponseEntity.ok(veterinarianService.updateVeterinarian(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('VETERINARIANS_DELETE')")
    @Operation(summary = "Delete veterinarian", description = "Delete veterinarian")
    public ResponseEntity<MessageResponse> deleteVeterinarian(@PathVariable UUID id) {
        veterinarianService.deleteVeterinarian(id);
        return ResponseEntity.ok(new MessageResponse("Veterinarian deleted successfully"));
    }
}
