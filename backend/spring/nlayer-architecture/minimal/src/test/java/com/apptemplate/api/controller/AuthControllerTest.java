package com.apptemplate.api.controller;

import com.apptemplate.api.dto.AuthResponse;
import com.apptemplate.api.dto.RefreshTokenRequest;
import com.apptemplate.api.dto.ValidateTokenRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @BeforeEach
    void setup() {
        AuthController controller = new AuthController(authService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void validateToken_returnsOk() throws Exception {
        ValidateTokenRequest request = new ValidateTokenRequest();
        request.setToken("external-token");

        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(1L)
                .username("testuser")
                .email("test@test.com")
                .firstName("Test")
                .lastName("User")
                .fullName("Test User")
                .role("user")
                .departmentId(null)
                .isActive(true)
                .build();

        AuthResponse response = AuthResponse.builder()
                .accessToken("jwt-token")
                .refreshToken("refresh-token")
                .expiresIn(3600)
                .user(userDto)
                .build();

        when(authService.validateToken(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/validate-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"));
    }

    @Test
    void refresh_returnsOk() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("valid-refresh-token");

        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(1L)
                .username("testuser")
                .email("test@test.com")
                .firstName("Test")
                .lastName("User")
                .fullName("Test User")
                .role("user")
                .departmentId(null)
                .isActive(true)
                .build();

        AuthResponse response = AuthResponse.builder()
                .accessToken("new-jwt-token")
                .refreshToken("new-refresh-token")
                .expiresIn(3600)
                .user(userDto)
                .build();

        when(authService.refresh(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("new-jwt-token"));
    }

    @Test
    void me_returnsOk() throws Exception {
        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(1L)
                .username("testuser")
                .email("test@test.com")
                .firstName("Test")
                .lastName("User")
                .fullName("Test User")
                .role("user")
                .departmentId(null)
                .isActive(true)
                .build();

        when(authService.getCurrentUser()).thenReturn(userDto);

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }
}
