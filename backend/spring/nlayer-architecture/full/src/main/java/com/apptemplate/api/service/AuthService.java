package com.apptemplate.api.service;

import com.apptemplate.api.dto.*;
import com.apptemplate.api.exception.AuthenticationException;
import com.apptemplate.api.exception.BadRequestException;
import com.apptemplate.api.exception.ConflictException;
import com.apptemplate.api.exception.NotFoundException;
import com.apptemplate.api.model.RefreshToken;
import com.apptemplate.api.model.User;
import com.apptemplate.api.repository.RefreshTokenRepository;
import com.apptemplate.api.repository.UserRepository;
import com.apptemplate.api.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("User with this email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("User with this username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("user");
        user.setActive(true);

        String firstName = request.getFirstName() != null ? request.getFirstName() : request.getUsername();
        String lastName = request.getLastName() != null ? request.getLastName() : "";
        user.setFullName(firstName, lastName);

        User savedUser = userRepository.save(user);

        String accessToken = jwtUtils.generateToken(savedUser);
        RefreshToken refreshToken = RefreshToken.create(savedUser.getId(), 7);
        refreshTokenRepository.save(refreshToken);

        auditLogService.log("create", "User", savedUser.getId().toString(),
                savedUser.getId(), savedUser.getUsername(), "User registered", null);

        return AuthResponse.of(accessToken, jwtUtils.getExpirationSeconds(), refreshToken.getToken(),
                mapToUserInfo(savedUser));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new AuthenticationException("Account is deactivated");
        }

        user.recordLogin();
        userRepository.save(user);

        String accessToken = jwtUtils.generateToken(user);
        RefreshToken refreshToken = RefreshToken.create(user.getId(), 7);
        refreshTokenRepository.save(refreshToken);

        auditLogService.log("login", "User", user.getId().toString(),
                user.getId(), user.getUsername(), "User logged in", null);

        return AuthResponse.of(accessToken, jwtUtils.getExpirationSeconds(), refreshToken.getToken(),
                mapToUserInfo(user));
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken existingToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AuthenticationException("Invalid refresh token"));

        if (!existingToken.isActive()) {
            throw new AuthenticationException("Refresh token is expired or revoked");
        }

        User user = userRepository.findById(existingToken.getUserId())
                .orElseThrow(() -> new AuthenticationException("User not found"));

        // Rotate refresh token
        existingToken.revoke();
        refreshTokenRepository.save(existingToken);

        String accessToken = jwtUtils.generateToken(user);
        RefreshToken newRefreshToken = RefreshToken.create(user.getId(), 7);
        refreshTokenRepository.save(newRefreshToken);

        return AuthResponse.tokenOnly(accessToken, jwtUtils.getExpirationSeconds(), newRefreshToken.getToken());
    }

    @Transactional
    public void logout(String refreshToken, Long userId) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
                token.revoke();
                refreshTokenRepository.save(token);
            });
        }
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                auditLogService.log("logout", "User", userId.toString(),
                        userId, user.getUsername(), "User logged out", null);
            }
        }
    }

    public UserInfoDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User", userId));
        return mapToUserInfo(user);
    }

    public UserDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User", userId));
        return mapToUserDto(user);
    }

    @Transactional
    public UserDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User", userId));

        String firstName = request.getFirstName() != null ? request.getFirstName() : user.getFirstName();
        String lastName = request.getLastName() != null ? request.getLastName() : user.getLastName();
        user.setFullName(firstName, lastName);

        User savedUser = userRepository.save(user);
        return mapToUserDto(savedUser);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(24));
            userRepository.save(user);
            // In real app, send email with reset link
        });
        // Always return success to prevent email enumeration
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid reset request"));

        if (user.getPasswordResetToken() == null ||
            !user.getPasswordResetToken().equals(request.getToken()) ||
            user.getPasswordResetTokenExpiry() == null ||
            LocalDateTime.now().isAfter(user.getPasswordResetTokenExpiry())) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
    }

    private UserInfoDto mapToUserInfo(User user) {
        String departmentName = null;
        // Department name would be resolved via join or separate query in production
        return UserInfoDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getName())
                .role(user.getRole())
                .departmentId(user.getDepartmentId())
                .departmentName(departmentName)
                .isActive(user.isActive())
                .build();
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getName())
                .role(user.getRole())
                .departmentId(user.getDepartmentId())
                .isActive(user.isActive())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
