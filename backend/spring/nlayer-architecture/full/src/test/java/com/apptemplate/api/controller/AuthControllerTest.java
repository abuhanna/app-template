package com.apptemplate.api.controller;

import com.apptemplate.api.dto.AuthResponse;
import com.apptemplate.api.dto.LoginRequest;
import com.apptemplate.api.dto.RegisterRequest;
import com.apptemplate.api.dto.UserInfoDto;
import com.apptemplate.api.security.JwtUtils;
import com.apptemplate.api.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @Mock
    private JwtUtils jwtUtils;

    @BeforeEach
    void setup() {
        AuthController controller = new AuthController(authService, jwtUtils);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void register_returnsCreated() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@test.com");
        request.setPassword("Password123");

        UserInfoDto userInfo = UserInfoDto.builder()
                .id(1L)
                .username("testuser")
                .email("test@test.com")
                .firstName("testuser")
                .lastName("")
                .role("user")
                .isActive(true)
                .build();

        AuthResponse response = AuthResponse.of("jwt-token", 3600, "refresh-token", userInfo);

        when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.data.user.username").value("testuser"));
    }

    @Test
    void login_returnsOk() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("Password123");

        UserInfoDto userInfo = UserInfoDto.builder()
                .id(1L)
                .username("testuser")
                .email("test@test.com")
                .role("user")
                .isActive(true)
                .build();

        AuthResponse response = AuthResponse.of("jwt-token", 3600, "refresh-token", userInfo);

        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("jwt-token"));
    }

    @Test
    void register_withInvalidEmail_returnsBadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("invalid-email");
        request.setPassword("Password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_withBlankPassword_returnsBadRequest() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
