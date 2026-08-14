package com.veterinaria.backend.owner.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.owner.dto.CreateOwnerDTO;
import com.veterinaria.backend.owner.dto.OwnerDTO;
import com.veterinaria.backend.owner.dto.UpdateOwnerDTO;
import com.veterinaria.backend.owner.service.OwnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/owners")
@RequiredArgsConstructor
@Tag(name = "Owners", description = "Client / Pet Owner management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class OwnerController {

    private final OwnerService ownerService;

    @GetMapping
    @PreAuthorize("hasAuthority('OWNERS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get owners paginated", description = "Get list of clients with optional search query and pagination")
    public ResponseEntity<PaginatedResponse<OwnerDTO>> getOwners(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        int pageNumber = limit > 0 ? offset / limit : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OwnerDTO> pageResult = ownerService.getAllOwnersPaginated(search, status, pageRequest);

        return ResponseEntity.ok(PaginatedResponse.<OwnerDTO>builder()
                .count(pageResult.getTotalElements())
                .next(pageResult.hasNext() ? "?limit=" + limit + "&offset=" + (offset + limit) + (search != null ? "&search=" + search : "") : null)
                .previous(pageResult.hasPrevious() ? "?limit=" + limit + "&offset=" + Math.max(0, offset - limit) + (search != null ? "&search=" + search : "") : null)
                .results(pageResult.getContent())
                .build());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('OWNERS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get all owners", description = "Get list of all active clients without pagination")
    public ResponseEntity<List<OwnerDTO>> getAllOwners(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(ownerService.getAllOwners(search));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('OWNERS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get owner by ID", description = "Get details of a specific client")
    public ResponseEntity<OwnerDTO> getOwnerById(@PathVariable UUID id) {
        return ResponseEntity.ok(ownerService.getOwnerById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('OWNERS_CREATE') or hasAuthority('USERS_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Create owner", description = "Register a new client/owner")
    public ResponseEntity<OwnerDTO> createOwner(@Valid @RequestBody CreateOwnerDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ownerService.createOwner(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('OWNERS_UPDATE') or hasAuthority('USERS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Update owner", description = "Update details of an existing client")
    public ResponseEntity<OwnerDTO> updateOwner(@PathVariable UUID id, @Valid @RequestBody UpdateOwnerDTO dto) {
        return ResponseEntity.ok(ownerService.updateOwner(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('OWNERS_DELETE') or hasAuthority('USERS_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Delete owner", description = "Deactivate client account")
    public ResponseEntity<MessageResponse> deleteOwner(@PathVariable UUID id) {
        ownerService.deleteOwner(id);
        return ResponseEntity.ok(new MessageResponse("Cliente desactivado exitosamente"));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAuthority('OWNERS_UPDATE') or hasAuthority('USERS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Reactivate owner", description = "Reactivate a previously deactivated client account")
    public ResponseEntity<MessageResponse> reactivateOwner(@PathVariable UUID id) {
        ownerService.reactivateOwner(id);
        return ResponseEntity.ok(new MessageResponse("Cliente reactivado exitosamente"));
    }
}
