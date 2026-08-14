package com.veterinaria.backend.deworming.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.deworming.dto.CreateDewormingRecordDTO;
import com.veterinaria.backend.deworming.dto.DewormingRecordDTO;
import com.veterinaria.backend.deworming.dto.UpdateDewormingRecordDTO;
import com.veterinaria.backend.deworming.service.DewormingRecordService;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/deworming")
@RequiredArgsConstructor
@Tag(name = "Deworming", description = "Pet deworming record endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class DewormingRecordController {

    private final DewormingRecordService dewormingRecordService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('DEWORMING_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get deworming records paginated", description = "Get list of deworming records with optional filters")
    public ResponseEntity<PaginatedResponse<DewormingRecordDTO>> getDewormingRecords(
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) UUID veterinarianId,
            @RequestParam(required = false) String dewormingType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate applicationFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate applicationTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nextApplicationFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nextApplicationTo,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        int pageNumber = limit > 0 ? offset / limit : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, limit, Sort.by(Sort.Direction.DESC, "applicationDate"));
        Page<DewormingRecordDTO> pageResult = dewormingRecordService.getAllDewormingRecordsPaginated(
                petId, veterinarianId, dewormingType, applicationFrom, applicationTo, nextApplicationFrom, nextApplicationTo, status, pageRequest);

        return ResponseEntity.ok(PaginatedResponse.<DewormingRecordDTO>builder()
                .count(pageResult.getTotalElements())
                .next(pageResult.hasNext() ? "?limit=" + limit + "&offset=" + (offset + limit) : null)
                .previous(pageResult.hasPrevious() ? "?limit=" + limit + "&offset=" + Math.max(0, offset - limit) : null)
                .results(pageResult.getContent())
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DEWORMING_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get deworming record by ID", description = "Get details of a specific deworming record")
    public ResponseEntity<DewormingRecordDTO> getDewormingRecordById(@PathVariable UUID id) {
        return ResponseEntity.ok(dewormingRecordService.getDewormingRecordById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('DEWORMING_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Create deworming record", description = "Register a new deworming treatment applied to a pet")
    public ResponseEntity<DewormingRecordDTO> createDewormingRecord(@Valid @RequestBody CreateDewormingRecordDTO dto, Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(dewormingRecordService.createDewormingRecord(dto, currentUser.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DEWORMING_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Update deworming record", description = "Update details of an existing deworming record")
    public ResponseEntity<DewormingRecordDTO> updateDewormingRecord(@PathVariable UUID id, @Valid @RequestBody UpdateDewormingRecordDTO dto) {
        return ResponseEntity.ok(dewormingRecordService.updateDewormingRecord(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DEWORMING_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Delete deworming record", description = "Delete a deworming record")
    public ResponseEntity<MessageResponse> deleteDewormingRecord(@PathVariable UUID id) {
        dewormingRecordService.deleteDewormingRecord(id);
        return ResponseEntity.ok(new MessageResponse("Registro de desparasitación eliminado exitosamente"));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAuthority('DEWORMING_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Reactivate deworming record", description = "Reactivate a previously deactivated deworming record")
    public ResponseEntity<MessageResponse> reactivateDewormingRecord(@PathVariable UUID id) {
        dewormingRecordService.reactivateDewormingRecord(id);
        return ResponseEntity.ok(new MessageResponse("Registro de desparasitación reactivado exitosamente"));
    }

    private User getAuthenticatedUser(Authentication authentication) {
        String principal = authentication.getName();
        return userRepository.findByEmail(principal)
                .or(() -> userRepository.findByUsername(principal))
                .orElseThrow(() -> new NotFoundException("Usuario autenticado no encontrado."));
    }
}
