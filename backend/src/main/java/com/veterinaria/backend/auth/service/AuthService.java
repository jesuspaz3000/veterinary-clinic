package com.veterinaria.backend.auth.service;

import com.veterinaria.backend.auth.dto.AuthSessionResult;
import com.veterinaria.backend.auth.dto.LoginRequest;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.common.exception.UnauthorizedException;
import com.veterinaria.backend.user.dto.UserDTO;
import com.veterinaria.backend.user.mapper.UserMapper;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final TokenBlacklistService tokenBlacklistService;

    @Transactional
    public AuthSessionResult login(LoginRequest request){
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new NotFoundException("User not found"));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        UserDTO userDTO = userMapper.toDTO(user);

        return new AuthSessionResult(userDTO, accessToken, refreshToken);
    }

    public void logout(String accessToken, String refreshToken){
        if(accessToken != null && !accessToken.isBlank()){
            tokenBlacklistService.blacklistToken(accessToken);
        }
        if(refreshToken != null && !refreshToken.isBlank()){
            tokenBlacklistService.blacklistToken(refreshToken);
        }
    }

    @Transactional
    public AuthSessionResult refreshToken(String refreshToken) {
        if (tokenBlacklistService.isTokenBlacklisted(refreshToken)) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        String userEmail = jwtService.extractUsername(refreshToken);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        tokenBlacklistService.blacklistToken(refreshToken);

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        return new AuthSessionResult(userMapper.toDTO(user), newAccessToken, newRefreshToken);
    }

    @Transactional
    public AuthSessionResult refreshToken(String refreshToken, String oldAccessToken) {
        if (oldAccessToken != null && !oldAccessToken.isBlank()) {
            tokenBlacklistService.blacklistToken(oldAccessToken);
        }
        return refreshToken(refreshToken);
    }
}
