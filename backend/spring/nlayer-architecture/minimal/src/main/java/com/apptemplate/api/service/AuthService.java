package com.apptemplate.api.service;

import com.apptemplate.api.dto.AuthResponse;
import com.apptemplate.api.dto.RefreshTokenRequest;
import com.apptemplate.api.dto.UpdateProfileRequest;
import com.apptemplate.api.dto.ValidateTokenRequest;
import com.apptemplate.api.exception.AuthenticationException;
import com.apptemplate.api.exception.NotFoundException;
import com.apptemplate.api.model.RefreshToken;
import com.apptemplate.api.model.User;
import com.apptemplate.api.repository.RefreshTokenRepository;
import com.apptemplate.api.repository.UserRepository;
import com.apptemplate.api.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public AuthResponse validateToken(ValidateTokenRequest request) {
        // Validate the external token (shared secret / SSO token)
        // In a real implementation, this would verify the token against an external auth provider
        try {
            String email = jwtUtils.extractUsername(request.getToken());
            if (email == null) {
                throw new AuthenticationException("Invalid token");
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new NotFoundException("User", "email", email));

            if (!user.isActive()) {
                throw new AuthenticationException("Account is disabled");
            }

            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            String accessToken = jwtUtils.generateTokenForUser(user);
            String refreshToken = createRefreshToken(user.getId());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtUtils.getExpirationSeconds())
                    .user(AuthResponse.UserDto.fromEntity(user))
                    .build();
        } catch (AuthenticationException | NotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthenticationException("Invalid or expired token");
        }
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken existingToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AuthenticationException("Invalid refresh token"));

        if (!existingToken.isActive()) {
            refreshTokenRepository.revokeAllByUserId(existingToken.getUserId());
            throw new AuthenticationException("Invalid refresh token - possible token reuse detected");
        }

        if (existingToken.isExpired()) {
            throw new AuthenticationException("Refresh token has expired");
        }

        User user = userRepository.findById(existingToken.getUserId())
                .orElseThrow(() -> new NotFoundException("User", existingToken.getUserId()));

        // Revoke old token
        existingToken.setRevokedAt(LocalDateTime.now());

        // Generate new tokens
        String accessToken = jwtUtils.generateTokenForUser(user);
        String newRefreshTokenValue = createRefreshToken(user.getId());

        existingToken.setReplacedByToken(newRefreshTokenValue);
        refreshTokenRepository.save(existingToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshTokenValue)
                .expiresIn(jwtUtils.getExpirationSeconds())
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
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User", "email", email));
        return AuthResponse.UserDto.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserDto getProfile() {
        return getCurrentUser();
    }

    @Transactional
    public AuthResponse.UserDto updateProfile(UpdateProfileRequest request) {
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User", "email", email));

        String firstName = request.getFirstName() != null ? request.getFirstName() : user.getFirstName();
        String lastName = request.getLastName() != null ? request.getLastName() : user.getLastName();
        user.setFullName(firstName, lastName);

        User savedUser = userRepository.save(user);
        return AuthResponse.UserDto.fromEntity(savedUser);
    }

    private String createRefreshToken(Long userId) {
        String tokenValue = UUID.randomUUID().toString().replace("-", "") +
                UUID.randomUUID().toString().replace("-", "");
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .userId(userId)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
