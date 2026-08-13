package com.veterinaria.backend.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {
    private final StringRedisTemplate redisTemplate;
    private final JwtService jwtService;

    public void blacklistToken(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        try {
            long expiration = jwtService.getExpirationTime(token);
            String jti = jwtService.extractJti(token);
            if (expiration > 0) {
                redisTemplate.opsForValue().set(
                        "blacklist:" + jti,
                        "true",
                        expiration,
                        TimeUnit.MILLISECONDS
                );
                log.debug("Token blacklisted with TTL: {}ms", expiration);
            }
        } catch (Exception e) {
            log.warn("Could not blacklist token (session still cleared on client): {}", e.toString());
        }
    }

    public boolean isTokenBlacklisted(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            String jti = jwtService.extractJti(token);
            return Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + jti));
        } catch (Exception e) {
            log.warn("Redis unavailable while checking blacklist: {}", e.toString());
            return false;
        }
    }
}