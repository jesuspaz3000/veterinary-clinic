package com.veterinaria.backend.role.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.util.PaginationValidator;
import com.veterinaria.backend.role.dto.RoleCreateUpdateDTO;
import com.veterinaria.backend.role.dto.RoleDTO;
import com.veterinaria.backend.role.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@Tag(name = "Role", description = "Role endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class RoleController {
    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLES_READ')")
    @Operation(summary = "Get all roles", description = "Get all roles")
    public ResponseEntity<PaginatedResponse<RoleDTO>> getAllRoles(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) String search,
            HttpServletRequest request){

        if(limit != null && offset != null){
            PaginationValidator.validatePaginationParams(limit, offset);
            int page = (offset + limit - 1) / limit;
            Pageable pageable = PageRequest.of(page, limit, Sort.by("id").ascending());
            Page<RoleDTO> rolesPage = roleService.getAllRolesPaginated(search, pageable);
            PaginatedResponse<RoleDTO> response = PaginationValidator.buildPaginatedResponse(
                    rolesPage,
                    limit,
                    offset,
                    request.getRequestURI(),
                    request.getQueryString()
            );
            return ResponseEntity.ok(response);
        } else {
            List<RoleDTO> roles = roleService.getAllRoles(search);
            PaginatedResponse<RoleDTO> response = PaginatedResponse.<RoleDTO>builder()
                    .count((long) roles.size())
                    .next(null)
                    .previous(null)
                    .results(new ArrayList<>(roles))
                    .build();
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLES_READ')")
    @Operation(summary = "Get a role by id", description = "Get a role by id")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable UUID id){
        RoleDTO roleDTO = roleService.getRoleById(id);
        return ResponseEntity.ok(roleDTO);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLES_CREATE')")
    @Operation(summary = "Create a new role", description = "Create a new role")
    public ResponseEntity<RoleDTO> createRole(@Valid @RequestBody RoleCreateUpdateDTO roleCreateUpdateDTO){
        RoleDTO roleDTO = roleService.createRole(roleCreateUpdateDTO);
        return ResponseEntity.ok(roleDTO);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLES_UPDATE')")
    @Operation(summary = "Update a role", description = "Update a role")
    public ResponseEntity<RoleDTO> updateRole(@PathVariable UUID id, @Valid @RequestBody RoleCreateUpdateDTO roleCreateUpdateDTO){
        RoleDTO roleDTO = roleService.updateRole(id, roleCreateUpdateDTO);
        return ResponseEntity.ok(roleDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLES_DELETE')")
    @Operation(summary = "Delete a role", description = "Delete a role")
    public ResponseEntity<MessageResponse> deleteRole(@PathVariable UUID id){
        roleService.deleteRole(id);
        return ResponseEntity.ok(new MessageResponse("Role deleted successfully"));
    }
}
