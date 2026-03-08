package com.apptemplate.api.features.auth;

import com.apptemplate.api.common.security.JwtUtils;
import com.apptemplate.api.features.users.User;
import com.apptemplate.api.features.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtUtils.generateToken(userDetails);

        // Create refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .token(generateRefreshTokenValue())
                .userId(user.getId())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())
                .user(AuthResponse.UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken existingToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (!existingToken.isActive()) {
            refreshTokenRepository.revokeAllByUserId(existingToken.getUserId());
            throw new RuntimeException("Invalid refresh token - possible token reuse detected");
        }

        if (existingToken.isExpired()) {
            throw new RuntimeException("Refresh token has expired");
        }

        User user = userRepository.findById(existingToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Revoke old token
        existingToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(existingToken);

        // Generate new tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtils.generateToken(userDetails);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .token(generateRefreshTokenValue())
                .userId(user.getId())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        existingToken.setReplacedByToken(newRefreshToken.getToken());
        refreshTokenRepository.save(existingToken);
        refreshTokenRepository.save(newRefreshToken);

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(newRefreshToken.getToken())
                .user(AuthResponse.UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null) {
            refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
                token.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(token);
            });
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserDto getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return AuthResponse.UserDto.fromEntity(user);
    }

    private String generateRefreshTokenValue() {
        return UUID.randomUUID().toString().replace("-", "") +
               UUID.randomUUID().toString().replace("-", "");
    }
}
