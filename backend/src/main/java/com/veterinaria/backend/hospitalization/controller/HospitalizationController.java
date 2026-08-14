package com.veterinaria.backend.hospitalization.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.hospitalization.dto.CreateHospitalizationEvolutionDTO;
import com.veterinaria.backend.hospitalization.dto.CreateHospitalizationRecordDTO;
import com.veterinaria.backend.hospitalization.dto.HospitalizationEvolutionDTO;
import com.veterinaria.backend.hospitalization.dto.HospitalizationRecordDTO;
import com.veterinaria.backend.hospitalization.dto.UpdateHospitalizationRecordDTO;
import com.veterinaria.backend.hospitalization.service.HospitalizationRecordService;
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
@RequestMapping("/hospitalizations")
@RequiredArgsConstructor
@Tag(name = "Hospitalizations", description = "Pet hospitalization record and evolution endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class HospitalizationController {

    private final HospitalizationRecordService hospitalizationRecordService;

    @GetMapping
    @PreAuthorize("hasAuthority('HOSPITALIZATION_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get hospitalization records paginated", description = "Get list of hospitalization records with optional filters")
    public ResponseEntity<PaginatedResponse<HospitalizationRecordDTO>> getHospitalizationRecords(
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String activeStatus,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        int pageNumber = limit > 0 ? offset / limit : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, limit, Sort.by(Sort.Direction.DESC, "admissionDate"));
        Page<HospitalizationRecordDTO> pageResult = hospitalizationRecordService.getAllHospitalizationRecordsPaginated(
                petId, status, from, to, activeStatus, pageRequest);

        return ResponseEntity.ok(PaginatedResponse.<HospitalizationRecordDTO>builder()
                .count(pageResult.getTotalElements())
                .next(pageResult.hasNext() ? "?limit=" + limit + "&offset=" + (offset + limit) : null)
                .previous(pageResult.hasPrevious() ? "?limit=" + limit + "&offset=" + Math.max(0, offset - limit) : null)
                .results(pageResult.getContent())
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('HOSPITALIZATION_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get hospitalization record by ID", description = "Get details of a specific hospitalization record, including its evolutions")
    public ResponseEntity<HospitalizationRecordDTO> getHospitalizationRecordById(@PathVariable UUID id) {
        return ResponseEntity.ok(hospitalizationRecordService.getHospitalizationRecordById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('HOSPITALIZATION_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Create hospitalization record", description = "Admit a pet for hospitalization")
    public ResponseEntity<HospitalizationRecordDTO> createHospitalizationRecord(@Valid @RequestBody CreateHospitalizationRecordDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hospitalizationRecordService.createHospitalizationRecord(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('HOSPITALIZATION_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Update hospitalization record", description = "Update details or discharge status of an existing hospitalization record")
    public ResponseEntity<HospitalizationRecordDTO> updateHospitalizationRecord(@PathVariable UUID id, @Valid @RequestBody UpdateHospitalizationRecordDTO dto) {
        return ResponseEntity.ok(hospitalizationRecordService.updateHospitalizationRecord(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('HOSPITALIZATION_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Delete hospitalization record", description = "Delete a hospitalization record and its evolutions")
    public ResponseEntity<MessageResponse> deleteHospitalizationRecord(@PathVariable UUID id) {
        hospitalizationRecordService.deleteHospitalizationRecord(id);
        return ResponseEntity.ok(new MessageResponse("Registro de hospitalización eliminado exitosamente"));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAuthority('HOSPITALIZATION_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Reactivate hospitalization record", description = "Reactivate a previously deactivated hospitalization record")
    public ResponseEntity<MessageResponse> reactivateHospitalizationRecord(@PathVariable UUID id) {
        hospitalizationRecordService.reactivateHospitalizationRecord(id);
        return ResponseEntity.ok(new MessageResponse("Registro de hospitalización reactivado exitosamente"));
    }

    @PostMapping("/{id}/evolutions")
    @PreAuthorize("hasAuthority('HOSPITALIZATION_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Add evolution entry", description = "Register a new evolution/follow-up entry for a hospitalization record")
    public ResponseEntity<HospitalizationEvolutionDTO> addEvolution(@PathVariable UUID id, @Valid @RequestBody CreateHospitalizationEvolutionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hospitalizationRecordService.addEvolution(id, dto));
    }

    @DeleteMapping("/{id}/evolutions/{evolutionId}")
    @PreAuthorize("hasAuthority('HOSPITALIZATION_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Delete evolution entry", description = "Delete an evolution/follow-up entry from a hospitalization record")
    public ResponseEntity<MessageResponse> deleteEvolution(@PathVariable UUID id, @PathVariable UUID evolutionId) {
        hospitalizationRecordService.deleteEvolution(id, evolutionId);
        return ResponseEntity.ok(new MessageResponse("Evolución eliminada exitosamente"));
    }
}
