package apptemplate.api.controllers;

import apptemplate.application.dto.user.ChangePasswordRequest;
import apptemplate.application.dto.user.CreateUserRequest;
import apptemplate.application.dto.user.UpdateUserRequest;
import apptemplate.application.dto.user.UserDto;
import apptemplate.application.usecases.user.*;
import apptemplate.domain.enums.UserRole;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UsersControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private GetUsersUseCase getUsersUseCase;

    @Mock
    private GetUserByIdUseCase getUserByIdUseCase;

    @Mock
    private CreateUserUseCase createUserUseCase;

    @Mock
    private UpdateUserUseCase updateUserUseCase;

    @Mock
    private DeleteUserUseCase deleteUserUseCase;

    @Mock
    private ChangeUserPasswordUseCase changeUserPasswordUseCase;

    @BeforeEach
    void setup() {
        UsersController controller = new UsersController(
                getUsersUseCase,
                getUserByIdUseCase,
                createUserUseCase,
                updateUserUseCase,
                deleteUserUseCase,
                changeUserPasswordUseCase
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getUsers_returnsPagedResponse() throws Exception {
        UserDto user = new UserDto();
        user.setId(1L);
        user.setUsername("testuser");

        Page<UserDto> page = new PageImpl<>(List.of(user));
        when(getUsersUseCase.execute(any(), any(), any(), anyInt(), anyInt(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/users")
                        .param("page", "1")
                        .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].id").value(1));
    }

    @Test
    void getUserById_returnsUser() throws Exception {
        UserDto user = new UserDto();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@test.com");

        when(getUserByIdUseCase.execute(1L)).thenReturn(user);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void createUser_returnsCreated() throws Exception {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("newuser");
        request.setEmail("new@test.com");
        request.setPassword("Pass@123");
        request.setRole(UserRole.USER);

        UserDto createdUser = new UserDto();
        createdUser.setId(2L);
        createdUser.setUsername("newuser");

        when(createUserUseCase.execute(any())).thenReturn(createdUser);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.username").value("newuser"));
    }

    @Test
    void updateUser_returnsOk() throws Exception {
        UpdateUserRequest request = new UpdateUserRequest();
        request.setFirstName("Updated");
        request.setEmail("test@test.com");
        request.setRole(UserRole.USER);
        request.setIsActive(true);

        UserDto updatedUser = new UserDto();
        updatedUser.setId(1L);
        updatedUser.setFirstName("Updated");

        when(updateUserUseCase.execute(eq(1L), any())).thenReturn(updatedUser);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"));
    }

    @Test
    void deleteUser_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());

        verify(deleteUserUseCase).execute(1L);
    }

    @Test
    void changePassword_returnsOk() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("OldPass@123");
        request.setNewPassword("NewPass@123");
        request.setConfirmPassword("NewPass@123");

        mockMvc.perform(post("/api/users/1/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully"));

        verify(changeUserPasswordUseCase).execute(eq(1L), any());
    }
}
