package com.veterinaria.backend.administrative.controller;

import com.veterinaria.backend.administrative.dto.AdministrativeStaffDTO;
import com.veterinaria.backend.administrative.dto.CreateAdministrativeStaffDTO;
import com.veterinaria.backend.administrative.dto.UpdateAdministrativeStaffDTO;
import com.veterinaria.backend.administrative.service.AdministrativeStaffService;
import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.util.PaginationValidator;
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
@RequestMapping("/administrative-staff")
@RequiredArgsConstructor
@Tag(name = "AdministrativeStaff", description = "Administrative staff management")
@SecurityRequirement(name = "Bearer Authentication")
public class AdministrativeStaffController {
    private final AdministrativeStaffService administrativeStaffService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_READ') or hasAuthority('USERS_READ')")
    @Operation(summary = "Get all administrative staff", description = "Get all administrative staff")
    public ResponseEntity<PaginatedResponse<AdministrativeStaffDTO>> getAllAdministrativeStaff(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) String search,
            HttpServletRequest request
    ) {
        if (limit != null) {
            int effectiveOffset = offset != null ? offset : 0;
            Pageable pageable = PaginationValidator.getPageable(limit, effectiveOffset, Sort.by("createdAt").descending());
            Page<AdministrativeStaffDTO> staffPage = administrativeStaffService.getAllAdministrativeStaffPaginated(search, pageable);
            PaginatedResponse<AdministrativeStaffDTO> response = PaginationValidator.buildPaginatedResponse(
                    staffPage,
                    limit,
                    effectiveOffset,
                    request.getRequestURI(),
                    request.getQueryString()
            );
            return ResponseEntity.ok(response);
        } else {
            List<AdministrativeStaffDTO> staff = administrativeStaffService.getAllAdministrativeStaff(search);
            PaginatedResponse<AdministrativeStaffDTO> response = PaginatedResponse.<AdministrativeStaffDTO>builder()
                    .count((long) staff.size())
                    .next(null)
                    .previous(null)
                    .results(new ArrayList<>(staff))
                    .build();
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_READ')")
    @Operation(summary = "Get administrative staff by id", description = "Get administrative staff by id")
    public ResponseEntity<AdministrativeStaffDTO> getAdministrativeStaffById(@PathVariable UUID id) {
        return ResponseEntity.ok(administrativeStaffService.getAdministrativeStaffById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_CREATE') or hasAuthority('USERS_CREATE')")
    @Operation(summary = "Create administrative staff", description = "Create administrative staff")
    public ResponseEntity<AdministrativeStaffDTO> createAdministrativeStaff(@Valid @ModelAttribute CreateAdministrativeStaffDTO dto) {
        return ResponseEntity.ok(administrativeStaffService.createAdministrativeStaff(dto));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_UPDATE') or hasAuthority('USERS_UPDATE')")
    @Operation(summary = "Update administrative staff", description = "Update administrative staff")
    public ResponseEntity<AdministrativeStaffDTO> updateAdministrativeStaff(
            @PathVariable UUID id,
            @Valid @ModelAttribute UpdateAdministrativeStaffDTO dto
    ) {
        return ResponseEntity.ok(administrativeStaffService.updateAdministrativeStaff(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATIVE_DELETE') or hasAuthority('USERS_DELETE')")
    @Operation(summary = "Delete administrative staff", description = "Delete administrative staff")
    public ResponseEntity<MessageResponse> deleteAdministrativeStaff(@PathVariable UUID id) {
        administrativeStaffService.deleteAdministrativeStaff(id);
        return ResponseEntity.ok(new MessageResponse("Administrative staff deleted successfully"));
    }
}
