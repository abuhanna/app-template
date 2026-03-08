package com.apptemplate.api.controller;

import com.apptemplate.api.dto.*;
import com.apptemplate.api.security.JwtUtils;
import com.apptemplate.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    @Operation(summary = "Register", description = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Registration successful"));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate user and receive JWT tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Get a new access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Invalidate refresh token")
    public ResponseEntity<Void> logout(@RequestBody(required = false) RefreshTokenRequest request) {
        Long userId = getCurrentUserId();
        authService.logout(request != null ? request.getRefreshToken() : null, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get basic info of authenticated user from JWT claims")
    public ResponseEntity<ApiResponse<UserInfoDto>> getCurrentUser(HttpServletRequest request) {
        String token = extractToken(request);
        UserInfoDto userInfo = UserInfoDto.builder()
                .id(getCurrentUserId())
                .username(token != null ? jwtUtils.getUsernameFromToken(token) : null)
                .email(token != null ? jwtUtils.getEmailFromToken(token) : null)
                .role(token != null ? jwtUtils.getRoleFromToken(token) : null)
                .build();
        return ResponseEntity.ok(ApiResponse.success(userInfo));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get my profile", description = "Get full profile of authenticated user from DB")
    public ResponseEntity<ApiResponse<UserDto>> getProfile() {
        Long userId = getCurrentUserId();
        UserDto profile = authService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update my profile", description = "Update profile of authenticated user")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = getCurrentUserId();
        UserDto profile = authService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile updated successfully"));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change password of authenticated user")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = getCurrentUserId();
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Request password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "If the email exists, a password reset link has been sent"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long) {
            return (Long) auth.getPrincipal();
        }
        return null;
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
