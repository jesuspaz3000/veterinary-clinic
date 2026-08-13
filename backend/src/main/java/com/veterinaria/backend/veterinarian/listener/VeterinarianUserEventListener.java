package com.veterinaria.backend.veterinarian.listener;

import com.veterinaria.backend.common.constants.RoleNames;
import com.veterinaria.backend.user.event.UserDeactivatedEvent;
import com.veterinaria.backend.user.event.UserRoleChangedEvent;
import com.veterinaria.backend.user.repository.UserRepository;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import com.veterinaria.backend.veterinarian.repository.VeterinarianRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class VeterinarianUserEventListener {
    private final VeterinarianRepository veterinarianRepository;
    private final UserRepository userRepository;

    @EventListener
    public void onUserRoleChanged(UserRoleChangedEvent event) {
        if (RoleNames.VETERINARIAN.equalsIgnoreCase(event.roleName())) {
            var vetOpt = veterinarianRepository.findByUserId(event.userId());
            if (vetOpt.isPresent()) {
                Veterinarian vet = vetOpt.get();
                vet.setStatus("activo");
                veterinarianRepository.saveAndFlush(vet);
            } else {
                userRepository.findById(event.userId()).ifPresent(user -> {
                    String defaultLicense = "VET-" + user.getId().toString().substring(0, 8).toUpperCase();
                    Veterinarian vet = Veterinarian.builder()
                            .user(user)
                            .licenseNumber(defaultLicense)
                            .status(Boolean.TRUE.equals(user.getIsActive()) ? "activo" : "inactivo")
                            .build();
                    veterinarianRepository.saveAndFlush(vet);
                    log.info("Created Veterinarian profile for user: {}", user.getUsername());
                });
            }
        } else {
            veterinarianRepository.findByUserId(event.userId()).ifPresent(vet -> {
                vet.setStatus("inactivo");
                veterinarianRepository.saveAndFlush(vet);
            });
        }
    }

    @EventListener
    public void onUserDeactivated(UserDeactivatedEvent event) {
        veterinarianRepository.findByUserId(event.userId()).ifPresent(vet -> {
            vet.setStatus("inactivo");
            veterinarianRepository.saveAndFlush(vet);
        });
    }
}
