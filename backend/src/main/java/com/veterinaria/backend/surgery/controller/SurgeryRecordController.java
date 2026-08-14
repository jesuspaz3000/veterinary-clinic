package com.veterinaria.backend.surgery.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.surgery.dto.CreateSurgeryRecordDTO;
import com.veterinaria.backend.surgery.dto.SurgeryRecordDTO;
import com.veterinaria.backend.surgery.dto.UpdateSurgeryRecordDTO;
import com.veterinaria.backend.surgery.service.SurgeryRecordService;
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
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/surgeries")
@RequiredArgsConstructor
@Tag(name = "Surgeries", description = "Pet surgery record endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class SurgeryRecordController {

    private final SurgeryRecordService surgeryRecordService;

    @GetMapping
    @PreAuthorize("hasAuthority('SURGERIES_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get surgery records paginated", description = "Get list of surgery records with optional filters")
    public ResponseEntity<PaginatedResponse<SurgeryRecordDTO>> getSurgeryRecords(
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) UUID veterinarianId,
            @RequestParam(required = false) String surgeryType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String activeStatus,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        int pageNumber = limit > 0 ? offset / limit : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, limit, Sort.by(Sort.Direction.DESC, "surgeryDate"));
        Page<SurgeryRecordDTO> pageResult = surgeryRecordService.getAllSurgeryRecordsPaginated(
                petId, veterinarianId, surgeryType, status, from, to, activeStatus, pageRequest);

        return ResponseEntity.ok(PaginatedResponse.<SurgeryRecordDTO>builder()
                .count(pageResult.getTotalElements())
                .next(pageResult.hasNext() ? "?limit=" + limit + "&offset=" + (offset + limit) : null)
                .previous(pageResult.hasPrevious() ? "?limit=" + limit + "&offset=" + Math.max(0, offset - limit) : null)
                .results(pageResult.getContent())
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SURGERIES_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get surgery record by ID", description = "Get details of a specific surgery record")
    public ResponseEntity<SurgeryRecordDTO> getSurgeryRecordById(@PathVariable UUID id) {
        return ResponseEntity.ok(surgeryRecordService.getSurgeryRecordById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SURGERIES_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Create surgery record", description = "Register a new surgery for a pet")
    public ResponseEntity<SurgeryRecordDTO> createSurgeryRecord(@Valid @RequestBody CreateSurgeryRecordDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(surgeryRecordService.createSurgeryRecord(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SURGERIES_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Update surgery record", description = "Update details or status of an existing surgery record")
    public ResponseEntity<SurgeryRecordDTO> updateSurgeryRecord(@PathVariable UUID id, @Valid @RequestBody UpdateSurgeryRecordDTO dto) {
        return ResponseEntity.ok(surgeryRecordService.updateSurgeryRecord(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SURGERIES_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Delete surgery record", description = "Delete a surgery record")
    public ResponseEntity<MessageResponse> deleteSurgeryRecord(@PathVariable UUID id) {
        surgeryRecordService.deleteSurgeryRecord(id);
        return ResponseEntity.ok(new MessageResponse("Registro de cirugía eliminado exitosamente"));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAuthority('SURGERIES_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Reactivate surgery record", description = "Reactivate a previously deactivated surgery record")
    public ResponseEntity<MessageResponse> reactivateSurgeryRecord(@PathVariable UUID id) {
        surgeryRecordService.reactivateSurgeryRecord(id);
        return ResponseEntity.ok(new MessageResponse("Registro de cirugía reactivado exitosamente"));
    }
}
