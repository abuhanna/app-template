package apptemplate.api.controllers;

import apptemplate.application.dto.auth.*;
import apptemplate.application.usecases.auth.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

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
    private GetCurrentUserUseCase getCurrentUserUseCase;

    @BeforeEach
    void setup() {
        AuthController controller = new AuthController(
                loginUseCase,
                refreshTokenUseCase,
                logoutUseCase,
                getCurrentUserUseCase
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void login_returnsOk() throws Exception {
        LoginRequest request = new LoginRequest("external-sso-token");
        LoginResponse response = LoginResponse.builder()
                .accessToken("jwt-token")
                .expiresIn(3600)
                .build();

        when(loginUseCase.execute(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-token"));
    }

    @Test
    void refresh_returnsOk() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("refresh-token");
        LoginResponse response = LoginResponse.builder()
                .accessToken("new-jwt-token")
                .build();

        when(refreshTokenUseCase.execute(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-jwt-token"));
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
    void getCurrentUser_returnsOk() throws Exception {
        UserInfoResponse response = UserInfoResponse.builder()
                .userId("1")
                .username("admin")
                .email("admin@test.com")
                .role("ADMIN")
                .build();

        when(getCurrentUserUseCase.execute()).thenReturn(response);

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"));
    }
}
