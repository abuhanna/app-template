package com.apptemplate.api.controller;

import com.apptemplate.api.dto.UserDto;
import com.apptemplate.api.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @BeforeEach
    void setup() {
        UserController controller = new UserController(userService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getAllUsers_returnsPagedResult() throws Exception {
        UserDto user1 = UserDto.builder()
                .id(1L)
                .username("testuser")
                .firstName("Test")
                .lastName("User")
                .email("test@test.com")
                .build();

        Page<UserDto> page = new PageImpl<>(List.of(user1));
        when(userService.getUsers(any(), any(), any(), anyInt(), anyInt(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].username").value("testuser"))
                .andExpect(jsonPath("$.pagination").exists());
    }

    @Test
    void getUserById_whenExists_returnsUser() throws Exception {
        UserDto user = UserDto.builder()
                .id(1L)
                .username("testuser")
                .firstName("Test")
                .lastName("User")
                .email("test@test.com")
                .build();

        when(userService.getUserById(1L)).thenReturn(user);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    void createUser_returnsCreated() throws Exception {
        UserDto createdUser = UserDto.builder()
                .id(2L)
                .username("newuser")
                .firstName("New")
                .lastName("User")
                .email("new@test.com")
                .build();

        when(userService.createUser(any())).thenReturn(createdUser);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"newuser\",\"email\":\"new@test.com\",\"password\":\"Password123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(2))
                .andExpect(jsonPath("$.data.username").value("newuser"));
    }

    @Test
    void updateUser_whenExists_returnsUpdatedUser() throws Exception {
        UserDto updatedUser = UserDto.builder()
                .id(1L)
                .username("updateduser")
                .firstName("Updated")
                .lastName("User")
                .email("updated@test.com")
                .build();

        when(userService.updateUser(eq(1L), any())).thenReturn(updatedUser);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"updateduser\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("updateduser"));
    }

    @Test
    void deleteUser_returnsNoContent() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());
    }
}
