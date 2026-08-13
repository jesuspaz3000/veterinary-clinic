package com.veterinaria.backend.auth.controller;

import com.veterinaria.backend.auth.cookie.AuthCookieNames;
import com.veterinaria.backend.auth.cookie.AuthCookieService;
import com.veterinaria.backend.auth.dto.*;
import com.veterinaria.backend.auth.service.AuthService;
import com.veterinaria.backend.common.exception.UnauthorizedException;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {
    private final AuthService authService;
    private final AuthCookieService authCookieService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        AuthSessionResult authSessionResult = authService.login(loginRequest);
        authCookieService.addAuthCookies(response, authSessionResult.accessToken(), authSessionResult.refreshToken());
        return ResponseEntity.ok(LoginResponse.builder().user(authSessionResult.user()).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestBody(required = false) LogoutRequest logoutRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        String access = firstNonBlank(
                logoutRequest != null ? logoutRequest.getAccessToken() : null,
                authCookieService.readCookie(request, AuthCookieNames.ACCESS_TOKEN)
        );
        String refresh = firstNonBlank(
                logoutRequest != null ? logoutRequest.getRefreshToken() : null,
                authCookieService.readCookie(request, AuthCookieNames.REFRESH_TOKEN)
        );

        authService.logout(access, refresh);
        authCookieService.clearAuthCookies(response);
        return ResponseEntity.ok(Map.of("message", "Session successfully closed"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<LoginResponse> refreshToken(@RequestBody(required = false) RefreshTokenRequest refreshTokenRequest, HttpServletRequest request, HttpServletResponse response){
        String refresh = resolveRefreshToken(refreshTokenRequest, request);
        if (refresh == null || refresh.isBlank()) {
            throw new UnauthorizedException("Refresh token is required");
        }
        String oldAccess = authCookieService.readCookie(request, AuthCookieNames.ACCESS_TOKEN);
        AuthSessionResult result = authService.refreshToken(refresh, oldAccess);
        authCookieService.addAuthCookies(response, result.accessToken(), result.refreshToken());
        return ResponseEntity.ok(LoginResponse.builder().user(result.user()).build());
    }

    private String resolveRefreshToken(RefreshTokenRequest body, HttpServletRequest request) {
        if (body != null && body.getRefreshToken() != null && !body.getRefreshToken().isBlank()) {
            return body.getRefreshToken();
        }
        return authCookieService.readCookie(request, AuthCookieNames.REFRESH_TOKEN);
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        return null;
    }
}
