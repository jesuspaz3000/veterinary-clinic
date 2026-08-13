package com.veterinaria.backend.auth.cookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuthCookieService {
    private static final String API_COOKIE_PATH = "/api";
    private static final String ROOT_PATH = "/";

    @Value("${jwt.access-token-expiration}")
    private Duration accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Duration refreshTokenExpiration;

    @Value("${app.auth.cookie.secure:false}")
    private boolean secure;

    @Value("${app.auth.cookie.same-site:Lax}")
    private String sameSite;

    @Value("${app.auth.cookie.domain:}")
    private String domain;

    public void addAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        for (ResponseCookie c : buildAuthCookies(accessToken, refreshToken)) {
            response.addHeader(HttpHeaders.SET_COOKIE, c.toString());
        }
    }

    public void clearAuthCookies(HttpServletResponse response) {
        for (ResponseCookie c : buildClearCookies()) {
            response.addHeader(HttpHeaders.SET_COOKIE, c.toString());
        }
    }

    public List<ResponseCookie> buildAuthCookies(String accessToken, String refreshToken) {
        List<ResponseCookie> list = new ArrayList<>();

        list.add(buildCookie(AuthCookieNames.ACCESS_TOKEN, accessToken, accessTokenExpiration));
        list.add(buildCookie(AuthCookieNames.REFRESH_TOKEN, refreshToken, refreshTokenExpiration));
        list.add(buildSessionCookie(refreshTokenExpiration));
        return list;
    }

    private List<ResponseCookie> buildClearCookies() {
        List<ResponseCookie> list = new ArrayList<>();
        list.add(clearCookie(AuthCookieNames.ACCESS_TOKEN, API_COOKIE_PATH, true));
        list.add(clearCookie(AuthCookieNames.REFRESH_TOKEN, API_COOKIE_PATH, true));
        list.add(clearCookie(AuthCookieNames.AUTH_SESSION, ROOT_PATH, false));
        return list;
    }

    private ResponseCookie buildCookie(String name, String value, Duration maxAge) {
        ResponseCookie.ResponseCookieBuilder b = ResponseCookie.from(name, value)
                .path(API_COOKIE_PATH)
                .httpOnly(true)
                .secure(secure)
                .maxAge(maxAge)
                .sameSite(sameSite);
        if (domain != null && !domain.isBlank()) {
            b.domain(domain.trim());
        }
        return b.build();
    }

    private ResponseCookie buildSessionCookie(Duration maxAge) {
        ResponseCookie.ResponseCookieBuilder b = ResponseCookie.from(AuthCookieNames.AUTH_SESSION, "1")
                .path(ROOT_PATH)
                .httpOnly(false)
                .secure(secure)
                .maxAge(maxAge)
                .sameSite(sameSite);
        if (domain != null && !domain.isBlank()) {
            b.domain(domain.trim());
        }
        return b.build();
    }

    private ResponseCookie clearCookie(String name, String path, boolean httpOnly) {
        ResponseCookie.ResponseCookieBuilder b = ResponseCookie.from(name, "")
                .path(path)
                .httpOnly(httpOnly)
                .secure(secure)
                .maxAge(0)
                .sameSite(sameSite);
        if (domain != null && !domain.isBlank()) {
            b.domain(domain.trim());
        }
        return b.build();
    }

    public String readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }
}