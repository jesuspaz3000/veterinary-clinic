package com.veterinaria.backend.auth.dto;

import com.veterinaria.backend.user.dto.UserDTO;

public record AuthSessionResult(UserDTO user, String accessToken, String refreshToken) {}