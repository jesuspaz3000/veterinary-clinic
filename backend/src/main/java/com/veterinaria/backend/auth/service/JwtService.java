package com.veterinaria.backend.auth.service;

import com.veterinaria.backend.user.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import java.util.UUID;

@Slf4j
@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-expiration}")
    private Duration accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Duration refreshTokenExpiration;

    @Value("${jwt.issuer}")
    private String issuer;

    @PostConstruct
    public void init() {
        log.debug("JWT configured - issuer: {}", issuer);
    }


    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateAccessToken(UserDetails userDetails) {
        return generateAccessToken(new HashMap<>(), userDetails);
    }

    public String generateAccessToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(withTokenVersionClaim(extraClaims, userDetails), userDetails, accessTokenExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(withTokenVersionClaim(new HashMap<>(), userDetails), userDetails, refreshTokenExpiration);
    }

    public String extractJti(String token) {
        return extractClaim(token, Claims::getId);
    }

    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            Duration expiration
    ) {
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(resolveSubject(userDetails))
                .issuer(issuer)
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration.toMillis()))
                .signWith(getSignInKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String subject = extractUsername(token);
        final String tokenIssuer = extractClaim(token, Claims::getIssuer);
        final boolean baseValid = subject.equals(resolveSubject(userDetails))
                && !isTokenExpired(token)
                && issuer.equals(tokenIssuer);
        if (!baseValid) {
            return false;
        }
        if (userDetails instanceof User u) {
            Long tokenTv = extractTokenVersion(token);
            Long currentTv = u.getTokenVersion() == null ? 0L : u.getTokenVersion();
            return tokenTv != null && tokenTv.equals(currentTv);
        }
        return true;
    }

    private String resolveSubject(UserDetails userDetails) {
        if (userDetails instanceof User u) {
            return u.getEmail();
        }
        return userDetails.getUsername();
    }

    private Map<String, Object> withTokenVersionClaim(Map<String, Object> claims, UserDetails userDetails) {
        if (userDetails instanceof User u) {
            claims.put("tv", u.getTokenVersion() == null ? 0L : u.getTokenVersion());
        }
        return claims;
    }

    private Long extractTokenVersion(String token) {
        try {
            Object raw = extractClaim(token, c -> c.get("tv"));
            if (raw == null) return null;
            if (raw instanceof Number n) return n.longValue();
            return Long.parseLong(raw.toString());
        } catch (Exception e) {
            return null;
        }
    }

    public long getExpirationTime(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.getTime() - System.currentTimeMillis();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = HexFormat.of().parseHex(secretKey.trim());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}