package apptemplate.api.controllers;

import apptemplate.api.dto.ApiResponse;
import apptemplate.application.dto.auth.*;
import apptemplate.application.dto.user.ChangePasswordRequest;
import apptemplate.application.dto.user.UserDto;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.application.usecases.auth.*;
import apptemplate.application.usecases.user.ChangeUserPasswordUseCase;
import apptemplate.domain.exceptions.AuthenticationException;
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

    private final LoginUseCase loginUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final RequestPasswordResetUseCase requestPasswordResetUseCase;
    private final ResetPasswordUseCase resetPasswordUseCase;
    private final GetCurrentUserUseCase getCurrentUserUseCase;
    private final GetMyProfileUseCase getMyProfileUseCase;
    private final UpdateMyProfileUseCase updateMyProfileUseCase;
    private final ChangeUserPasswordUseCase changeUserPasswordUseCase;
    private final CurrentUserService currentUserService;

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate user and receive JWT tokens")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = loginUseCase.execute(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Get a new access token using refresh token")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = refreshTokenUseCase.execute(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Invalidate refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody(required = false) RefreshTokenRequest request) {
        if (request != null) {
            logoutUseCase.execute(request.getRefreshToken());
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Send password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        requestPasswordResetUseCase.execute(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset email sent"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        resetPasswordUseCase.execute(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get basic info of authenticated user")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getCurrentUser() {
        UserInfoResponse response = getCurrentUserUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(response, "Current user retrieved successfully"));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get my profile", description = "Get full profile of authenticated user")
    public ResponseEntity<ApiResponse<UserDto>> getMyProfile() {
        UserDto profile = getMyProfileUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully"));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update my profile", description = "Update profile of authenticated user")
    public ResponseEntity<ApiResponse<UserDto>> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserDto profile = updateMyProfileUseCase.execute(request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile updated successfully"));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change password of authenticated user")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = currentUserService.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationException("User not authenticated"));
        changeUserPasswordUseCase.execute(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }
}
