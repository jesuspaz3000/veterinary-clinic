package com.veterinaria.backend.user.event;

import java.util.UUID;

public record UserDeactivatedEvent(UUID userId) {
}
