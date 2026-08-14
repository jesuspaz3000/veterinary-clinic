package com.veterinaria.backend.role.service;

import com.veterinaria.backend.role.dto.PermissionDTO;
import com.veterinaria.backend.role.dto.RoleCreateUpdateDTO;
import com.veterinaria.backend.role.dto.RoleDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface RoleService {
    // ===== CRUD ROLES ==
    RoleDTO createRole(RoleCreateUpdateDTO dto);
    RoleDTO updateRole(UUID id, RoleCreateUpdateDTO dto);
    void deleteRole(UUID id);
    void reactivateRole(UUID id);

    // ===== QUERYS ROLES ==
    RoleDTO getRoleById(UUID id);
    List<RoleDTO> getAllRoles(String search, String status);
    Page<RoleDTO> getAllRolesPaginated(String search, String status, Pageable pageable);

    // ===== QUERYS PERMISSIONS ==
    List<PermissionDTO> getAllPermissions(String search);
    Page<PermissionDTO> getAllPermissionsPaginated(String search, Pageable pageable);

    // ===== SUPERADMIN INITIAL ROLE =====
    void assignAllPermissionsToSuperAdmin();
    void initializeDefaultRoles();
    void initializeDefaultPermissions();
}
