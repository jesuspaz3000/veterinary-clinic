package com.veterinaria.backend.administrative.listener;

import com.veterinaria.backend.administrative.model.AdministrativeStaff;
import com.veterinaria.backend.administrative.repository.AdministrativeStaffRepository;
import com.veterinaria.backend.common.constants.RoleNames;
import com.veterinaria.backend.user.event.UserDeactivatedEvent;
import com.veterinaria.backend.user.event.UserRoleChangedEvent;
import com.veterinaria.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdministrativeStaffUserEventListener {
    private final AdministrativeStaffRepository administrativeStaffRepository;
    private final UserRepository userRepository;

    @EventListener
    public void onUserRoleChanged(UserRoleChangedEvent event) {
        if (RoleNames.ADMINISTRATIVE.equalsIgnoreCase(event.roleName())) {
            if (administrativeStaffRepository.findByUserId(event.userId()).isEmpty()) {
                userRepository.findById(event.userId()).ifPresent(user -> {
                    AdministrativeStaff staff = AdministrativeStaff.builder()
                            .user(user)
                            .build();
                    administrativeStaffRepository.saveAndFlush(staff);
                    log.info("Created AdministrativeStaff profile for user: {}", user.getUsername());
                });
            }
        } else {
            administrativeStaffRepository.findByUserId(event.userId()).ifPresent(staff -> {
                administrativeStaffRepository.delete(staff);
                log.info("Deleted AdministrativeStaff profile for user {} (role is not ADMINISTRATIVE)", event.userId());
            });
        }
    }

    @EventListener
    public void onUserDeactivated(UserDeactivatedEvent event) {
        administrativeStaffRepository.findByUserId(event.userId()).ifPresent(staff ->
                log.info("Administrative staff associated with deactivated user {}", event.userId()));
    }
}
