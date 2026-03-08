package com.apptemplate.api.features.auth;

import com.apptemplate.api.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/validate-token")
    @Operation(summary = "Validate token", description = "Validate an external token and receive internal JWT tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> validateToken(@Valid @RequestBody ValidateTokenRequest request) {
        AuthResponse response = authService.validateToken(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Token validated successfully"));
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
        authService.logout(request != null ? request.getRefreshToken() : null);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get basic info of authenticated user from JWT claims")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> getCurrentUser() {
        AuthResponse.UserDto user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get my profile", description = "Get full profile of authenticated user from DB")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> getProfile() {
        AuthResponse.UserDto profile = authService.getProfile();
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update my profile", description = "Update profile of authenticated user")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        AuthResponse.UserDto profile = authService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile updated successfully"));
    }
}
