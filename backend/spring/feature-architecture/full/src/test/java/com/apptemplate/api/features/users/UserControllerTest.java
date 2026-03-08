package com.apptemplate.api.features.users;

import com.apptemplate.api.features.users.dto.CreateUserRequest;
import com.apptemplate.api.features.users.dto.UpdateUserRequest;
import com.apptemplate.api.features.users.dto.UserDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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
    void getAllUsers_returnsPagedUsers() throws Exception {
        UserDto user1 = new UserDto();
        user1.setId(1L);
        user1.setUsername("testuser");
        user1.setEmail("test@test.com");
        user1.setFirstName("Test");
        user1.setLastName("User");

        Page<UserDto> page = new PageImpl<>(List.of(user1), PageRequest.of(0, 10), 1);
        when(userService.getUsers(isNull(), isNull(), isNull(), eq(1), eq(10), isNull(), eq("desc")))
                .thenReturn(page);

        mockMvc.perform(get("/api/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.data[0].id").value(1))
                .andExpect(jsonPath("$.data.data[0].username").value("testuser"));
    }

    @Test
    void getUserById_whenExists_returnsUser() throws Exception {
        UserDto user = new UserDto();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@test.com");

        when(userService.getUserById(1L)).thenReturn(user);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    void createUser_returnsCreated() throws Exception {
        UserDto createdUser = new UserDto();
        createdUser.setId(2L);
        createdUser.setUsername("newuser");
        createdUser.setEmail("new@test.com");

        when(userService.createUser(any(CreateUserRequest.class))).thenReturn(createdUser);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"newuser\",\"email\":\"new@test.com\",\"password\":\"Password123\",\"role\":\"user\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(2))
                .andExpect(jsonPath("$.data.username").value("newuser"));
    }

    @Test
    void updateUser_whenExists_returnsUpdatedUser() throws Exception {
        UserDto updatedUser = new UserDto();
        updatedUser.setId(1L);
        updatedUser.setUsername("updateduser");

        when(userService.updateUser(eq(1L), any(UpdateUserRequest.class))).thenReturn(updatedUser);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"updateduser\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("updateduser"));
    }

    @Test
    void deleteUser_returnsNoContent() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());
    }
}
