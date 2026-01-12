package apptemplate.api.controller;

import apptemplate.api.dto.ApiResponse;
import apptemplate.api.dto.PagedResponse;
import apptemplate.application.dto.user.CreateUserRequest;
import apptemplate.application.dto.user.UpdateUserRequest;
import apptemplate.application.dto.user.UserDto;
import apptemplate.application.usecases.user.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UsersController {

    private final GetUsersUseCase getUsersUseCase;
    private final GetUserByIdUseCase getUserByIdUseCase;
    private final CreateUserUseCase createUserUseCase;
    private final UpdateUserUseCase updateUserUseCase;
    private final DeleteUserUseCase deleteUserUseCase;

    @GetMapping
    @Operation(summary = "Get all users", description = "Get paginated list of users with optional filters")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<UserDto> users = getUsersUseCase.execute(search, departmentId, isActive, pageable);
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(users)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Get a specific user by their ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable UUID id) {
        UserDto user = getUserByIdUseCase.execute(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create user", description = "Create a new user (Admin only)")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDto user = createUserUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(user, "User created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user", description = "Update an existing user (Admin only)")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UserDto user = updateUserUseCase.execute(id, request);
        return ResponseEntity.ok(ApiResponse.success(user, "User updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete a user (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        deleteUserUseCase.execute(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }
}
