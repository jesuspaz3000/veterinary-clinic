package com.veterinaria.backend.vaccination.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.vaccination.dto.CreateVaccinationRecordDTO;
import com.veterinaria.backend.vaccination.dto.UpdateVaccinationRecordDTO;
import com.veterinaria.backend.vaccination.dto.VaccinationRecordDTO;
import com.veterinaria.backend.vaccination.service.VaccinationRecordService;
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

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/vaccinations")
@RequiredArgsConstructor
@Tag(name = "Vaccinations", description = "Pet vaccination record endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class VaccinationRecordController {

    private final VaccinationRecordService vaccinationRecordService;

    @GetMapping
    @PreAuthorize("hasAuthority('VACCINATIONS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get vaccination records paginated", description = "Get list of vaccination records with optional pet/veterinarian/date filters")
    public ResponseEntity<PaginatedResponse<VaccinationRecordDTO>> getVaccinationRecords(
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) UUID veterinarianId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate applicationFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate applicationTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nextDoseFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nextDoseTo,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        int pageNumber = limit > 0 ? offset / limit : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, limit, Sort.by(Sort.Direction.DESC, "applicationDate"));
        Page<VaccinationRecordDTO> pageResult = vaccinationRecordService.getAllVaccinationRecordsPaginated(
                petId, veterinarianId, applicationFrom, applicationTo, nextDoseFrom, nextDoseTo, status, pageRequest);

        return ResponseEntity.ok(PaginatedResponse.<VaccinationRecordDTO>builder()
                .count(pageResult.getTotalElements())
                .next(pageResult.hasNext() ? "?limit=" + limit + "&offset=" + (offset + limit) : null)
                .previous(pageResult.hasPrevious() ? "?limit=" + limit + "&offset=" + Math.max(0, offset - limit) : null)
                .results(pageResult.getContent())
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VACCINATIONS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get vaccination record by ID", description = "Get details of a specific vaccination record")
    public ResponseEntity<VaccinationRecordDTO> getVaccinationRecordById(@PathVariable UUID id) {
        return ResponseEntity.ok(vaccinationRecordService.getVaccinationRecordById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('VACCINATIONS_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Create vaccination record", description = "Register a new vaccination applied to a pet")
    public ResponseEntity<VaccinationRecordDTO> createVaccinationRecord(@Valid @RequestBody CreateVaccinationRecordDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vaccinationRecordService.createVaccinationRecord(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('VACCINATIONS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Update vaccination record", description = "Update details of an existing vaccination record")
    public ResponseEntity<VaccinationRecordDTO> updateVaccinationRecord(@PathVariable UUID id, @Valid @RequestBody UpdateVaccinationRecordDTO dto) {
        return ResponseEntity.ok(vaccinationRecordService.updateVaccinationRecord(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('VACCINATIONS_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Delete vaccination record", description = "Delete a vaccination record")
    public ResponseEntity<MessageResponse> deleteVaccinationRecord(@PathVariable UUID id) {
        vaccinationRecordService.deleteVaccinationRecord(id);
        return ResponseEntity.ok(new MessageResponse("Registro de vacunación eliminado exitosamente"));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAuthority('VACCINATIONS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Reactivate vaccination record", description = "Reactivate a previously deactivated vaccination record")
    public ResponseEntity<MessageResponse> reactivateVaccinationRecord(@PathVariable UUID id) {
        vaccinationRecordService.reactivateVaccinationRecord(id);
        return ResponseEntity.ok(new MessageResponse("Registro de vacunación reactivado exitosamente"));
    }
}
