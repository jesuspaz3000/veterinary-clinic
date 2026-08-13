package com.veterinaria.backend.role.service.Impl;

import com.veterinaria.backend.common.constants.RoleNames;
import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.role.dto.PermissionDTO;
import com.veterinaria.backend.role.service.RoleService;
import com.veterinaria.backend.role.dto.RoleCreateUpdateDTO;
import com.veterinaria.backend.role.dto.RoleDTO;
import com.veterinaria.backend.role.model.Permission;
import com.veterinaria.backend.role.model.Role;
import com.veterinaria.backend.role.repository.PermissionRepository;
import com.veterinaria.backend.role.repository.RoleRepository;
import com.veterinaria.backend.user.repository.UserRepository;
import com.veterinaria.backend.role.mapper.RoleMapper;
import com.veterinaria.backend.role.mapper.PermissionMapper;

import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageImpl;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService{
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final RoleMapper roleMapper;
    private final PermissionMapper permissionMapper;

    @Override
    @Transactional
    public RoleDTO createRole(RoleCreateUpdateDTO roleDTO) {
        Set<Permission> permissions = (roleDTO.getPermissionIds() != null && !roleDTO.getPermissionIds().isEmpty())
                ? new HashSet<>(permissionRepository.findByIdIn(roleDTO.getPermissionIds()))
                : new HashSet<>();

        var existingRole = roleRepository.findByName(roleDTO.getName());
        if (existingRole.isPresent()) {
            Role existing = existingRole.get();
            if(Boolean.TRUE.equals(existing.getIsActive())){
                throw new ConflictException("Role is already active");
            }

            existing.setPermissions(permissions);
            existing.setDescription(roleDTO.getDescription());
            existing.setIsActive(true);
            Role reactivated = roleRepository.save(existing);
            roleRepository.flush();
            log.info("Role reactivated: {}", reactivated);
            return roleMapper.toDTO(reactivated);
        }

        Role role = Role.builder()
                .name(roleDTO.getName())
                .description(roleDTO.getDescription())
                .permissions(permissions)
                .build();

        Role savedRole = roleRepository.save(role);
        roleRepository.flush();

        return roleMapper.toDTO(savedRole);
    }

    @Override
    @Transactional
    public RoleDTO updateRole(UUID id, RoleCreateUpdateDTO roleDTO) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Role not found"));
        if(RoleNames.SUPERADMIN.equals(role.getName())){
            throw new BusinessException("Cannot update SUPERADMIN role");
        }
        
        if (RoleNames.SYSTEM_ROLES.contains(role.getName())) {
            if (!role.getName().equalsIgnoreCase(roleDTO.getName())) {
                throw new BusinessException("No se puede renombrar un rol del sistema: " + role.getName());
            }
        }

        if(!role.getName().equals(roleDTO.getName())){
            if(roleRepository.findByName(roleDTO.getName()).isPresent()){
                throw new ConflictException("Role name already exists");
            }
        }
        role.setName(roleDTO.getName());
        role.setDescription(roleDTO.getDescription());

        Set<Permission> permissions = (roleDTO.getPermissionIds() != null && !roleDTO.getPermissionIds().isEmpty())
                ? new HashSet<>(permissionRepository.findByIdIn(roleDTO.getPermissionIds()))
                : new HashSet<>();
        role.setPermissions(permissions);

        roleRepository.flush();

        log.info("Role updated: {}", role.getName());
        return roleMapper.toDTO(role);
    }

    @Override
    @Transactional
    public void deleteRole(UUID id){
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Role not found"));
        
        if (RoleNames.SYSTEM_ROLES.contains(role.getName())) {
            throw new BusinessException("No se puede eliminar un rol del sistema: " + role.getName());
        }

        long activeUsers = userRepository.countByRole_IdAndIsActiveTrue(id);
        if(activeUsers > 0){
            throw new BusinessException("Cannot delete role with active users");
        }
        role.setIsActive(false);
        roleRepository.save(role);
        roleRepository.flush();
        log.info("Role deactivated:{}", role.getName());
    }

    @Override
    public RoleDTO getRoleById(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Role not found"));
        return roleMapper.toDTO(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleDTO> getAllRoles(String search) {
        if(search == null || search.trim().isEmpty()){
            List<Role> roles = roleRepository.findByNameNot(RoleNames.SUPERADMIN);
            return roles.stream().map(roleMapper::toDTO).toList();
        }
        List<Role> roles = roleRepository.findBySearch(search);
        return roles.stream().map(roleMapper::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoleDTO> getAllRolesPaginated(String search, Pageable pageable){
        if(search == null || search.trim().isEmpty()){
            return roleRepository.findByNameNot(RoleNames.SUPERADMIN, pageable)
                    .map(roleMapper::toDTO);
        }
        return roleRepository.findBySearch(search, pageable)
                .map(roleMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionDTO> getAllPermissions(String search){
        if(search == null || search.trim().isEmpty()){
            return permissionRepository.findAll().stream().map(permissionMapper::toDTO).toList();
        }
        return permissionRepository.findBySearch(search).stream().map(permissionMapper::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PermissionDTO> getAllPermissionsPaginated(String search, Pageable pageable){
        if(search == null || search.trim().isEmpty()){
            return permissionRepository.findAll(pageable).map(permissionMapper::toDTO);
        }
        List<Permission> permissions = permissionRepository.findBySearch(search);
        int total = permissions.size();
        long offset = pageable.getOffset();
        int pageSize = pageable.getPageSize();
        if(offset >= total){
            return new PageImpl<>(List.of(), pageable, total);
        }
        int from = (int) offset;
        int to = Math.min(from + pageSize, total);
        List<PermissionDTO> slice = permissions.subList(from, to).stream().map(permissionMapper::toDTO).toList();
        return new PageImpl<>(slice, pageable, total);
    }

    @Override
    @Transactional
    public void assignAllPermissionsToSuperAdmin(){
        Role superAdminRole = roleRepository.findByName(RoleNames.SUPERADMIN)
                .orElseThrow(() -> new NotFoundException("SUPERADMIN role not found"));
        List<Permission> allPermissions = permissionRepository.findAll();
        superAdminRole.setPermissions(new HashSet<>(allPermissions));
        roleRepository.save(superAdminRole);
    }

    @Override
    @Transactional
    public void initializeDefaultRoles(){
        Map<String, List<String>> defaultRolePermissions = new LinkedHashMap<>();
        defaultRolePermissions.put(RoleNames.SUPERADMIN, List.of()); // Manejado aparte con assignAllPermissionsToSuperAdmin()
        defaultRolePermissions.put(RoleNames.VETERINARIAN, List.of(
                "VETERINARIANS_READ", "OWNERS_READ", "PETS_READ", "PRODUCTS_READ",
                "APPOINTMENTS_READ", "APPOINTMENTS_UPDATE",
                "SCHEDULES_READ",
                "MEDICAL_RECORDS_CREATE", "MEDICAL_RECORDS_READ", "MEDICAL_RECORDS_UPDATE",
                "VACCINATIONS_CREATE", "VACCINATIONS_READ", "VACCINATIONS_UPDATE",
                "DEWORMING_CREATE", "DEWORMING_READ", "DEWORMING_UPDATE"
        ));
        defaultRolePermissions.put(RoleNames.ADMIN, List.of(
                "USERS_CREATE", "USERS_READ", "USERS_UPDATE", "USERS_DELETE",
                "VETERINARIANS_CREATE", "VETERINARIANS_READ", "VETERINARIANS_UPDATE", "VETERINARIANS_DELETE",
                "GROOMING_CREATE", "GROOMING_READ", "GROOMING_UPDATE", "GROOMING_DELETE",
                "ADMINISTRATIVE_CREATE", "ADMINISTRATIVE_READ", "ADMINISTRATIVE_UPDATE", "ADMINISTRATIVE_DELETE",
                "OWNERS_CREATE", "OWNERS_READ", "OWNERS_UPDATE", "OWNERS_DELETE",
                "PETS_CREATE", "PETS_READ", "PETS_UPDATE", "PETS_DELETE",
                "PRODUCTS_CREATE", "PRODUCTS_READ", "PRODUCTS_UPDATE", "PRODUCTS_DELETE",
                "APPOINTMENTS_CREATE", "APPOINTMENTS_READ", "APPOINTMENTS_UPDATE", "APPOINTMENTS_DELETE",
                "SCHEDULES_CREATE", "SCHEDULES_READ", "SCHEDULES_UPDATE", "SCHEDULES_DELETE",
                "MEDICAL_RECORDS_CREATE", "MEDICAL_RECORDS_READ", "MEDICAL_RECORDS_UPDATE", "MEDICAL_RECORDS_DELETE",
                "VACCINATIONS_CREATE", "VACCINATIONS_READ", "VACCINATIONS_UPDATE", "VACCINATIONS_DELETE",
                "DEWORMING_CREATE", "DEWORMING_READ", "DEWORMING_UPDATE", "DEWORMING_DELETE"
        ));
        defaultRolePermissions.put(RoleNames.GROOMING, List.of(
                "GROOMING_READ", "OWNERS_READ", "PETS_READ",
                "SCHEDULES_READ"
        ));
        defaultRolePermissions.put(RoleNames.ADMINISTRATIVE, List.of(
                "ADMINISTRATIVE_READ", "OWNERS_READ", "PETS_READ", "PRODUCTS_READ",
                "APPOINTMENTS_CREATE", "APPOINTMENTS_READ", "APPOINTMENTS_UPDATE", "APPOINTMENTS_DELETE",
                "SCHEDULES_CREATE", "SCHEDULES_READ", "SCHEDULES_UPDATE", "SCHEDULES_DELETE",
                "MEDICAL_RECORDS_READ",
                "VACCINATIONS_READ",
                "DEWORMING_READ"
        ));

        for (Map.Entry<String, List<String>> entry : defaultRolePermissions.entrySet()) {
            String roleName = entry.getKey();
            Optional<Role> existingRole = roleRepository.findByName(roleName);
            if (existingRole.isEmpty()) {
                List<Permission> permissions = permissionRepository.findByNameIn(entry.getValue());
                Role role = Role.builder()
                        .name(roleName)
                        .description(roleName + " role")
                        .permissions(new HashSet<>(permissions))
                        .build();
                roleRepository.save(role);
                log.info("{} role created with {} permissions", roleName, permissions.size());
            } else {
                // Agrega los permisos nuevos del seed sin tocar los ya asignados
                Role role = existingRole.get();
                Set<String> currentNames = new HashSet<>();
                role.getPermissions().forEach(p -> currentNames.add(p.getName()));
                List<String> missingNames = entry.getValue().stream()
                        .filter(name -> !currentNames.contains(name))
                        .toList();
                if (missingNames.isEmpty()) {
                    log.info("{} role already exists, skipping seed", roleName);
                } else {
                    role.getPermissions().addAll(permissionRepository.findByNameIn(missingNames));
                    roleRepository.save(role);
                    log.info("{} role updated with {} new default permissions", roleName, missingNames.size());
                }
            }
        }
    }

    @Override
    @Transactional
    public void initializeDefaultPermissions(){
        log.info("Initializing default permissions");

        Map<String, List<String>> moduleActions = new LinkedHashMap<>();
        moduleActions.put("USERS", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("ROLES", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("PERMISSIONS", List.of("READ"));
        moduleActions.put("VETERINARIANS", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("GROOMING", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("ADMINISTRATIVE", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("OWNERS", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("PETS", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("PRODUCTS", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("SALES", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("APPOINTMENTS", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("SCHEDULES", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("MEDICAL_RECORDS", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("VACCINATIONS", List.of("CREATE", "READ", "UPDATE", "DELETE"));
        moduleActions.put("DEWORMING", List.of("CREATE", "READ", "UPDATE", "DELETE"));

        Set<String> existingNames = new HashSet<>();
        permissionRepository.findAll().forEach(p -> existingNames.add(p.getName()));

        List<Permission> toSave = moduleActions.entrySet().stream()
                .flatMap(entry -> entry.getValue().stream()
                        .map(action -> Permission.builder()
                                .name(entry.getKey() + "_" + action)
                                .action(action)
                                .module(entry.getKey())
                                .description(entry.getKey() + " " + action)
                                .descriptionEs(entry.getKey() + " " + action)
                                .labelEs(getLabelEs(entry.getKey(), action))
                                .build())
                )
                .filter(p -> !existingNames.contains(p.getName()))
                .toList();
        if(!toSave.isEmpty()){
            permissionRepository.saveAll(toSave);
            log.info("{} permissions created", toSave.size());
        }
        else{
            log.info("Default permissions already exist");
        }
    }

    private String getLabelEs(String module, String action){
        return switch (module + "_" + action){
            case "USERS_CREATE" -> "Crear usuarios";
            case "USERS_READ" -> "Ver usuarios";
            case "USERS_UPDATE" -> "Actualizar usuarios";
            case "USERS_DELETE" -> "Eliminar usuarios";

            case "ROLES_CREATE" -> "Crear roles";
            case "ROLES_READ" -> "Ver roles";
            case "ROLES_UPDATE" -> "Actualizar roles";
            case "ROLES_DELETE" -> "Eliminar roles";

            case "PERMISSIONS_READ" -> "Ver permisos";

            case "VETERINARIANS_CREATE" -> "Crear veterinarios";
            case "VETERINARIANS_READ" -> "Ver veterinarios";
            case "VETERINARIANS_UPDATE" -> "Actualizar veterinarios";
            case "VETERINARIANS_DELETE" -> "Eliminar veterinarios";

            case "GROOMING_CREATE" -> "Crear personal de peluquería";
            case "GROOMING_READ" -> "Ver personal de peluquería";
            case "GROOMING_UPDATE" -> "Actualizar personal de peluquería";
            case "GROOMING_DELETE" -> "Eliminar personal de peluquería";

            case "ADMINISTRATIVE_CREATE" -> "Crear personal administrativo";
            case "ADMINISTRATIVE_READ" -> "Ver personal administrativo";
            case "ADMINISTRATIVE_UPDATE" -> "Actualizar personal administrativo";
            case "ADMINISTRATIVE_DELETE" -> "Eliminar personal administrativo";

            case "OWNERS_CREATE" -> "Crear dueños/clientes";
            case "OWNERS_READ" -> "Ver dueños/clientes";
            case "OWNERS_UPDATE" -> "Actualizar dueños/clientes";
            case "OWNERS_DELETE" -> "Eliminar dueños/clientes";

            case "PETS_CREATE" -> "Crear mascotas";
            case "PETS_READ" -> "Ver mascotas";
            case "PETS_UPDATE" -> "Actualizar mascotas";
            case "PETS_DELETE" -> "Eliminar mascotas";

            case "PRODUCTS_CREATE" -> "Crear productos e inventario";
            case "PRODUCTS_READ" -> "Ver productos e inventario";
            case "PRODUCTS_UPDATE" -> "Actualizar productos e inventario";
            case "PRODUCTS_DELETE" -> "Eliminar productos e inventario";

            case "SALES_CREATE" -> "Registrar ventas y facturación";
            case "SALES_READ" -> "Ver ventas y comprobantes";
            case "SALES_UPDATE" -> "Emitir notas de crédito / anulación";
            case "SALES_DELETE" -> "Eliminar comprobantes de venta";

            case "APPOINTMENTS_CREATE" -> "Crear citas";
            case "APPOINTMENTS_READ" -> "Ver citas";
            case "APPOINTMENTS_UPDATE" -> "Actualizar citas";
            case "APPOINTMENTS_DELETE" -> "Cancelar citas";

            case "SCHEDULES_CREATE" -> "Crear horarios de profesionales";
            case "SCHEDULES_READ" -> "Ver horarios de profesionales";
            case "SCHEDULES_UPDATE" -> "Actualizar horarios de profesionales";
            case "SCHEDULES_DELETE" -> "Eliminar horarios de profesionales";

            case "MEDICAL_RECORDS_CREATE" -> "Crear registros médicos";
            case "MEDICAL_RECORDS_READ" -> "Ver historial médico";
            case "MEDICAL_RECORDS_UPDATE" -> "Actualizar registros médicos";
            case "MEDICAL_RECORDS_DELETE" -> "Eliminar registros médicos";

            case "VACCINATIONS_CREATE" -> "Registrar vacunaciones";
            case "VACCINATIONS_READ" -> "Ver vacunaciones";
            case "VACCINATIONS_UPDATE" -> "Actualizar vacunaciones";
            case "VACCINATIONS_DELETE" -> "Eliminar vacunaciones";

            case "DEWORMING_CREATE" -> "Registrar desparasitaciones";
            case "DEWORMING_READ" -> "Ver desparasitaciones";
            case "DEWORMING_UPDATE" -> "Actualizar desparasitaciones";
            case "DEWORMING_DELETE" -> "Eliminar desparasitaciones";

            default -> module + " " + action;
        };
    }
}
