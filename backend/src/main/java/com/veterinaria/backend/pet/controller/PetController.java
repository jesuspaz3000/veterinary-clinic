package com.veterinaria.backend.pet.controller;

import com.veterinaria.backend.clinicalhistory.dto.ClinicalHistoryEntryDTO;
import com.veterinaria.backend.clinicalhistory.service.ClinicalHistoryService;
import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.pet.dto.CreatePetDTO;
import com.veterinaria.backend.pet.dto.PetDTO;
import com.veterinaria.backend.pet.dto.PetPhotoDTO;
import com.veterinaria.backend.pet.dto.UpdatePetDTO;
import com.veterinaria.backend.pet.service.PetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
@Tag(name = "Pets", description = "Pet / Patient management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class PetController {

    private final PetService petService;
    private final ClinicalHistoryService clinicalHistoryService;

    @GetMapping
    @PreAuthorize("hasAuthority('PETS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get pets paginated", description = "Get list of pets with optional search query or owner filter")
    public ResponseEntity<PaginatedResponse<PetDTO>> getPets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID ownerId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        int pageNumber = limit > 0 ? offset / limit : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PetDTO> pageResult = petService.getAllPetsPaginated(search, ownerId, status, pageRequest);

        return ResponseEntity.ok(PaginatedResponse.<PetDTO>builder()
                .count(pageResult.getTotalElements())
                .next(pageResult.hasNext() ? "?limit=" + limit + "&offset=" + (offset + limit) + (search != null ? "&search=" + search : "") : null)
                .previous(pageResult.hasPrevious() ? "?limit=" + limit + "&offset=" + Math.max(0, offset - limit) + (search != null ? "&search=" + search : "") : null)
                .results(pageResult.getContent())
                .build());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('PETS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get all pets", description = "Get list of all active pets without pagination")
    public ResponseEntity<List<PetDTO>> getAllPets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID ownerId
    ) {
        return ResponseEntity.ok(petService.getAllPets(search, ownerId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PETS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get pet by ID", description = "Get details of a specific pet")
    public ResponseEntity<PetDTO> getPetById(@PathVariable UUID id) {
        return ResponseEntity.ok(petService.getPetById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PETS_CREATE') or hasAuthority('USERS_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Create pet", description = "Register a new pet")
    public ResponseEntity<PetDTO> createPet(@Valid @ModelAttribute CreatePetDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(petService.createPet(dto));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PETS_UPDATE') or hasAuthority('USERS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Update pet", description = "Update details of an existing pet")
    public ResponseEntity<PetDTO> updatePet(@PathVariable UUID id, @Valid @ModelAttribute UpdatePetDTO dto) {
        return ResponseEntity.ok(petService.updatePet(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PETS_DELETE') or hasAuthority('USERS_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Delete pet", description = "Deactivate pet profile")
    public ResponseEntity<MessageResponse> deletePet(@PathVariable UUID id) {
        petService.deletePet(id);
        return ResponseEntity.ok(new MessageResponse("Mascota desactivada exitosamente"));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAuthority('PETS_UPDATE') or hasAuthority('USERS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Reactivate pet", description = "Reactivate a previously deactivated pet profile")
    public ResponseEntity<MessageResponse> reactivatePet(@PathVariable UUID id) {
        petService.reactivatePet(id);
        return ResponseEntity.ok(new MessageResponse("Mascota reactivada exitosamente"));
    }

    @PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PETS_UPDATE') or hasAuthority('USERS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Add pet photo", description = "Upload an additional photo to a pet's gallery")
    public ResponseEntity<PetPhotoDTO> addPhoto(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(petService.addPhoto(id, file, description));
    }

    @GetMapping("/{id}/clinical-history")
    @PreAuthorize("hasAuthority('PETS_READ') or hasAuthority('MEDICAL_RECORDS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get pet clinical history", description = "Get a unified, chronologically sorted timeline of a pet's appointments, medical records, vaccinations, deworming, surgeries and hospitalizations")
    public ResponseEntity<List<ClinicalHistoryEntryDTO>> getClinicalHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(clinicalHistoryService.getClinicalHistory(id));
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    @PreAuthorize("hasAuthority('PETS_UPDATE') or hasAuthority('USERS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Remove pet photo", description = "Delete a photo from a pet's gallery")
    public ResponseEntity<MessageResponse> deletePhoto(@PathVariable UUID id, @PathVariable UUID photoId) {
        petService.deletePhoto(id, photoId);
        return ResponseEntity.ok(new MessageResponse("Foto eliminada exitosamente"));
    }
}
