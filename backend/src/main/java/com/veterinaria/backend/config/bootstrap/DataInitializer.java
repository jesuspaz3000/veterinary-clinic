package com.veterinaria.backend.config.bootstrap;

import com.veterinaria.backend.common.constants.RoleNames;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.role.model.Role;
import com.veterinaria.backend.role.repository.RoleRepository;
import com.veterinaria.backend.role.service.RoleService;
import com.veterinaria.backend.user.event.UserRoleChangedEvent;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final RoleService roleService;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    @NullMarked
    public void run(String... args){
        log.info("Initializing data...");
        try{
            roleService.initializeDefaultPermissions();
            roleService.initializeDefaultRoles();
            roleService.assignAllPermissionsToSuperAdmin();
            initSuperAdminUser();
            syncMissingUserProfiles();
            log.info("Data initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize data: {}", e.getMessage(), e);
        }
    }

    private void initSuperAdminUser(){
        String email = System.getenv("SUPERADMIN_EMAIL");
        String password = System.getenv("SUPERADMIN_PASSWORD");

        if(email == null || password == null){
            log.error("SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not found in environment variables");
            return;
        }

        if(!userRepository.existsByEmail(email)){
            Role superAdminRole = roleRepository.findByName(RoleNames.SUPERADMIN)
                    .orElseThrow(() -> new NotFoundException("SUPERADMIN role not found"));

            User superAdmin = User.builder()
                    .username("Super Admin")
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(superAdminRole)
                    .build();
            userRepository.save(superAdmin);
            log.info("Super admin user created: {}", superAdmin);
        }
        else{
            log.info("Super admin user already exists");
        }
    }

    private void syncMissingUserProfiles() {
        log.info("Syncing missing domain profiles for existing users...");

        // Cada feature (veterinarian, grooming, administrative) reacciona al evento
        // con su propio listener: crea el perfil si falta, lo desactiva o lo elimina
        // según corresponda al rol actual del usuario.
        userRepository.findAll().forEach(user -> {
            String roleName = user.getRole() != null ? user.getRole().getName() : null;
            eventPublisher.publishEvent(new UserRoleChangedEvent(user.getId(), roleName));
        });
    }
}
