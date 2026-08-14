package com.veterinaria.backend.grooming.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.util.PaginationValidator;
import com.veterinaria.backend.grooming.dto.CreateGroomingStaffDTO;
import com.veterinaria.backend.grooming.dto.GroomingStaffDTO;
import com.veterinaria.backend.grooming.dto.UpdateGroomingStaffDTO;
import com.veterinaria.backend.grooming.service.GroomingStaffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
@RequestMapping("/grooming-staff")
@RequiredArgsConstructor
@Tag(name = "GroomingStaff", description = "Grooming staff management")
@SecurityRequirement(name = "Bearer Authentication")
public class GroomingStaffController {

    private final GroomingStaffService groomingStaffService;

    @GetMapping
    @PreAuthorize("hasAuthority('GROOMING_READ') or hasAuthority('USERS_READ') or hasAuthority('APPOINTMENTS_READ')")
    @Operation(summary = "Get all grooming staff", description = "Get all grooming staff, paginated only if limit is provided")
    public ResponseEntity<PaginatedResponse<GroomingStaffDTO>> getAllGroomingStaff(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            HttpServletRequest request
    ) {
        if (limit != null) {
            int effectiveOffset = offset != null ? offset : 0;
            Pageable pageable = PaginationValidator.getPageable(limit, effectiveOffset, Sort.by("createdAt").descending());
            Page<GroomingStaffDTO> pageResult = groomingStaffService.getAllGroomingStaffPaginated(search, status, pageable);
            PaginatedResponse<GroomingStaffDTO> response = PaginationValidator.buildPaginatedResponse(
                    pageResult,
                    limit,
                    effectiveOffset,
                    request.getRequestURI(),
                    request.getQueryString()
            );
            return ResponseEntity.ok(response);
        } else {
            List<GroomingStaffDTO> staff = groomingStaffService.getAllGroomingStaff(search, status);
            PaginatedResponse<GroomingStaffDTO> response = PaginatedResponse.<GroomingStaffDTO>builder()
                    .count((long) staff.size())
                    .next(null)
                    .previous(null)
                    .results(new ArrayList<>(staff))
                    .build();
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GROOMING_READ')")
    @Operation(summary = "Get grooming staff by id", description = "Get grooming staff member by id")
    public ResponseEntity<GroomingStaffDTO> getGroomingStaffById(@PathVariable UUID id) {
        return ResponseEntity.ok(groomingStaffService.getGroomingStaffById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('GROOMING_CREATE') or hasAuthority('USERS_CREATE')")
    @Operation(summary = "Create grooming staff", description = "Create new grooming staff member")
    public ResponseEntity<GroomingStaffDTO> createGroomingStaff(@Valid @ModelAttribute CreateGroomingStaffDTO dto) {
        return ResponseEntity.ok(groomingStaffService.createGroomingStaff(dto));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('GROOMING_UPDATE') or hasAuthority('USERS_UPDATE')")
    @Operation(summary = "Update grooming staff", description = "Update existing grooming staff member")
    public ResponseEntity<GroomingStaffDTO> updateGroomingStaff(
            @PathVariable UUID id,
            @Valid @ModelAttribute UpdateGroomingStaffDTO dto
    ) {
        return ResponseEntity.ok(groomingStaffService.updateGroomingStaff(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('GROOMING_DELETE') or hasAuthority('USERS_DELETE')")
    @Operation(summary = "Delete grooming staff", description = "Deactivate grooming staff member")
    public ResponseEntity<MessageResponse> deleteGroomingStaff(@PathVariable UUID id) {
        groomingStaffService.deleteGroomingStaff(id);
        return ResponseEntity.ok(new MessageResponse("Grooming staff member deactivated successfully"));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAuthority('GROOMING_UPDATE')")
    @Operation(summary = "Reactivate grooming staff", description = "Reactivate a previously deactivated grooming staff member")
    public ResponseEntity<MessageResponse> reactivateGroomingStaff(@PathVariable UUID id) {
        groomingStaffService.reactivateGroomingStaff(id);
        return ResponseEntity.ok(new MessageResponse("Grooming staff member reactivated successfully"));
    }
}
