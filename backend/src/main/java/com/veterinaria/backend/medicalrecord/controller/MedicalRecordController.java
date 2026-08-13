package com.veterinaria.backend.medicalrecord.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.medicalrecord.dto.CreateMedicalRecordDTO;
import com.veterinaria.backend.medicalrecord.dto.MedicalDocumentDTO;
import com.veterinaria.backend.medicalrecord.dto.MedicalRecordDTO;
import com.veterinaria.backend.medicalrecord.dto.UpdateMedicalRecordDTO;
import com.veterinaria.backend.medicalrecord.service.MedicalRecordService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/medical-records")
@RequiredArgsConstructor
@Tag(name = "Medical Records", description = "Historial médico: registros clínicos, prescripciones y documentos")
@SecurityRequirement(name = "Bearer Authentication")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping
    @PreAuthorize("hasAuthority('MEDICAL_RECORDS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get medical records paginated", description = "List clinical records with optional pet, veterinarian, type, status and date-range filters")
    public ResponseEntity<PaginatedResponse<MedicalRecordDTO>> getMedicalRecords(
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) UUID veterinarianId,
            @RequestParam(required = false) String recordType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        int pageNumber = limit > 0 ? offset / limit : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, limit, Sort.by(Sort.Direction.DESC, "recordDate"));
        Page<MedicalRecordDTO> pageResult = medicalRecordService
                .getAllMedicalRecordsPaginated(petId, veterinarianId, recordType, status, from, to, pageRequest);

        return ResponseEntity.ok(PaginatedResponse.<MedicalRecordDTO>builder()
                .count(pageResult.getTotalElements())
                .next(pageResult.hasNext() ? "?limit=" + limit + "&offset=" + (offset + limit) : null)
                .previous(pageResult.hasPrevious() ? "?limit=" + limit + "&offset=" + Math.max(0, offset - limit) : null)
                .results(pageResult.getContent())
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MEDICAL_RECORDS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get medical record by ID", description = "Get full clinical record including prescriptions and documents")
    public ResponseEntity<MedicalRecordDTO> getMedicalRecordById(@PathVariable UUID id) {
        return ResponseEntity.ok(medicalRecordService.getMedicalRecordById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MEDICAL_RECORDS_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Create medical record", description = "Register a new clinical record with optional prescriptions")
    public ResponseEntity<MedicalRecordDTO> createMedicalRecord(@Valid @RequestBody CreateMedicalRecordDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicalRecordService.createMedicalRecord(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MEDICAL_RECORDS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Update medical record", description = "Update clinical data and replace prescriptions of an existing record")
    public ResponseEntity<MedicalRecordDTO> updateMedicalRecord(@PathVariable UUID id, @Valid @RequestBody UpdateMedicalRecordDTO dto) {
        return ResponseEntity.ok(medicalRecordService.updateMedicalRecord(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MEDICAL_RECORDS_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Delete medical record", description = "Delete a clinical record along with its prescriptions and documents")
    public ResponseEntity<MessageResponse> deleteMedicalRecord(@PathVariable UUID id) {
        medicalRecordService.deleteMedicalRecord(id);
        return ResponseEntity.ok(new MessageResponse("Registro médico eliminado exitosamente"));
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('MEDICAL_RECORDS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Attach document", description = "Upload a file (radiografía, examen, ecografía...) to a clinical record")
    public ResponseEntity<MedicalDocumentDTO> uploadDocument(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(required = false) String description
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicalRecordService.uploadDocument(id, file, documentType, description));
    }

    @DeleteMapping("/{id}/documents/{documentId}")
    @PreAuthorize("hasAuthority('MEDICAL_RECORDS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Remove document", description = "Delete an attached document from a clinical record")
    public ResponseEntity<MessageResponse> deleteDocument(@PathVariable UUID id, @PathVariable UUID documentId) {
        medicalRecordService.deleteDocument(id, documentId);
        return ResponseEntity.ok(new MessageResponse("Documento eliminado exitosamente"));
    }
}
