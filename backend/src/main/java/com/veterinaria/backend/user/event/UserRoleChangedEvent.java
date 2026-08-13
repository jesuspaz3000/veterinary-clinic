package com.veterinaria.backend.user.event;

import java.util.UUID;

public record UserRoleChangedEvent(UUID userId, String roleName) {
}
