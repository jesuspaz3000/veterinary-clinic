package com.veterinaria.backend.role.controller;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.util.PaginationValidator;
import com.veterinaria.backend.role.dto.PermissionDTO;
import com.veterinaria.backend.role.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@Tag(name = "Permission", description = "Permission endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class PermissionController {
    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSIONS_READ')")
    @Operation(summary = "Get all permissions", description = "Get all permissions")
    public ResponseEntity<PaginatedResponse<PermissionDTO>> getAllPermissions(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) String search,
            HttpServletRequest request
    ) {
        if (limit != null && offset != null) {
            PaginationValidator.validatePaginationParams(limit, offset);
            int page = (offset + limit - 1) / limit;
            Pageable pageable = PageRequest.of(page, limit, Sort.by("id").ascending());
            Page<PermissionDTO> permissionsPage = roleService.getAllPermissionsPaginated(search, pageable);
            PaginatedResponse<PermissionDTO> response = PaginationValidator.buildPaginatedResponse(
                    permissionsPage,
                    limit,
                    offset,
                    request.getRequestURI(),
                    request.getQueryString()
            );
            return ResponseEntity.ok(response);
        } else {
            List<PermissionDTO> permissions = roleService.getAllPermissions(search);
            PaginatedResponse<PermissionDTO> response = PaginatedResponse.<PermissionDTO>builder()
                    .count((long) permissions.size())
                    .next(null)
                    .previous(null)
                    .results(new ArrayList<>(permissions))
                    .build();
            return ResponseEntity.ok(response);
        }
    }
}
