package com.veterinaria.backend.grooming.listener;

import com.veterinaria.backend.common.constants.RoleNames;
import com.veterinaria.backend.grooming.model.GroomingStaff;
import com.veterinaria.backend.grooming.repository.GroomingStaffRepository;
import com.veterinaria.backend.user.event.UserDeactivatedEvent;
import com.veterinaria.backend.user.event.UserReactivatedEvent;
import com.veterinaria.backend.user.event.UserRoleChangedEvent;
import com.veterinaria.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GroomingStaffUserEventListener {
    private final GroomingStaffRepository groomingStaffRepository;
    private final UserRepository userRepository;

    @EventListener
    public void onUserRoleChanged(UserRoleChangedEvent event) {
        if (RoleNames.GROOMING.equalsIgnoreCase(event.roleName())) {
            var staffOpt = groomingStaffRepository.findByUserId(event.userId());
            if (staffOpt.isPresent()) {
                GroomingStaff staff = staffOpt.get();
                staff.setStatus("activo");
                groomingStaffRepository.saveAndFlush(staff);
            } else {
                userRepository.findById(event.userId()).ifPresent(user -> {
                    GroomingStaff staff = GroomingStaff.builder()
                            .user(user)
                            .status(Boolean.TRUE.equals(user.getIsActive()) ? "activo" : "inactivo")
                            .build();
                    groomingStaffRepository.saveAndFlush(staff);
                    log.info("Created GroomingStaff profile for user: {}", user.getUsername());
                });
            }
        } else {
            groomingStaffRepository.findByUserId(event.userId()).ifPresent(staff -> {
                staff.setStatus("inactivo");
                groomingStaffRepository.saveAndFlush(staff);
            });
        }
    }

    @EventListener
    public void onUserDeactivated(UserDeactivatedEvent event) {
        groomingStaffRepository.findByUserId(event.userId()).ifPresent(staff -> {
            staff.setStatus("inactivo");
            groomingStaffRepository.saveAndFlush(staff);
        });
    }

    @EventListener
    public void onUserReactivated(UserReactivatedEvent event) {
        groomingStaffRepository.findByUserId(event.userId()).ifPresent(staff -> {
            staff.setStatus("activo");
            groomingStaffRepository.saveAndFlush(staff);
        });
    }
}
