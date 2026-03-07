package apptemplate.api.controllers;

import apptemplate.application.dto.auth.*;
import apptemplate.application.dto.user.ChangePasswordRequest;
import apptemplate.application.dto.user.UserDto;
import apptemplate.application.usecases.auth.*;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.application.usecases.user.ChangeUserPasswordUseCase;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private LoginUseCase loginUseCase;

    @Mock
    private RefreshTokenUseCase refreshTokenUseCase;

    @Mock
    private LogoutUseCase logoutUseCase;

    @Mock
    private RequestPasswordResetUseCase requestPasswordResetUseCase;

    @Mock
    private ResetPasswordUseCase resetPasswordUseCase;

    @Mock
    private GetCurrentUserUseCase getCurrentUserUseCase;

    @Mock
    private GetMyProfileUseCase getMyProfileUseCase;

    @Mock
    private UpdateMyProfileUseCase updateMyProfileUseCase;

    @Mock
    private ChangeUserPasswordUseCase changeUserPasswordUseCase;

    @Mock
    private CurrentUserService currentUserService;

    @BeforeEach
    void setup() {
        AuthController controller = new AuthController(
                loginUseCase,
                refreshTokenUseCase,
                logoutUseCase,
                requestPasswordResetUseCase,
                resetPasswordUseCase,
                getCurrentUserUseCase,
                getMyProfileUseCase,
                updateMyProfileUseCase,
                changeUserPasswordUseCase,
                currentUserService
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void login_returnsOk() throws Exception {
        LoginRequest request = new LoginRequest("admin", null, "Admin@123");
        LoginResponse response = LoginResponse.builder()
                .token("jwt-token")
                .tokenType("Bearer")
                .expiresIn(3600)
                .build();

        when(loginUseCase.execute(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    void refresh_returnsOk() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("refresh-token");
        LoginResponse response = LoginResponse.builder()
                .token("new-jwt-token")
                .tokenType("Bearer")
                .build();

        when(refreshTokenUseCase.execute(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("new-jwt-token"));
    }

    @Test
    void logout_returnsOk() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("refresh-token");

        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(logoutUseCase).execute("refresh-token");
    }

    @Test
    void logout_withNullBody_returnsOk() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk());

        verify(logoutUseCase, never()).execute(any());
    }

    @Test
    void forgotPassword_returnsOk() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("user@test.com");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(requestPasswordResetUseCase).execute(any());
    }

    @Test
    void resetPassword_returnsOk() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("reset-token");
        request.setNewPassword("NewPass@123");
        request.setConfirmPassword("NewPass@123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(resetPasswordUseCase).execute(any());
    }

    @Test
    void getCurrentUser_returnsOk() throws Exception {
        UserInfoResponse response = UserInfoResponse.builder()
                .id(1L)
                .username("admin")
                .email("admin@test.com")
                .role("ADMIN")
                .build();

        when(getCurrentUserUseCase.execute()).thenReturn(response);

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"));
    }

    @Test
    void getMyProfile_returnsOk() throws Exception {
        UserDto profile = new UserDto();
        profile.setId(1L);
        profile.setUsername("admin");

        when(getMyProfileUseCase.execute()).thenReturn(profile);

        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void updateMyProfile_returnsOk() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("John Doe");
        request.setEmail("john@test.com");

        UserDto updatedProfile = new UserDto();
        updatedProfile.setId(1L);
        updatedProfile.setUsername("admin");

        when(updateMyProfileUseCase.execute(any())).thenReturn(updatedProfile);

        mockMvc.perform(put("/api/auth/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void changePassword_returnsOk() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("OldPass@123");
        request.setNewPassword("NewPass@123");
        request.setConfirmPassword("NewPass@123");

        mockMvc.perform(post("/api/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(changeUserPasswordUseCase).execute(any(ChangePasswordRequest.class));
    }
}
