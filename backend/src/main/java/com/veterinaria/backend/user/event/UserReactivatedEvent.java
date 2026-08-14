package com.veterinaria.backend.user.event;

import java.util.UUID;

public record UserReactivatedEvent(UUID userId) {
}
