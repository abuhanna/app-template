package apptemplate.api.controllers;

import apptemplate.api.dto.PagedResponse;
import apptemplate.application.dto.user.ChangePasswordRequest;
import apptemplate.application.dto.user.CreateUserRequest;
import apptemplate.application.dto.user.UpdateUserRequest;
import apptemplate.application.dto.user.UserDto;
import apptemplate.application.usecases.user.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


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
    private final ChangeUserPasswordUseCase changeUserPasswordUseCase;

    @GetMapping
    @Operation(summary = "Get all users", description = "Get paginated list of users with optional filters")
    public ResponseEntity<PagedResponse<UserDto>> getUsers(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Column to sort by (e.g., username, email, createdAt)") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "asc") String sortDir,
            @Parameter(description = "Search by username, email, or name") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by department ID") @RequestParam(required = false) Long departmentId,
            @Parameter(description = "Filter by active status") @RequestParam(required = false) Boolean isActive
    ) {
        // Ensure page is at least 1 and cap pageSize at 100
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        Page<UserDto> users = getUsersUseCase.execute(search, departmentId, isActive, page, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(PagedResponse.from(users));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Get a specific user by their ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto user = getUserByIdUseCase.execute(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create user", description = "Create a new user (Admin only)")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDto user = createUserUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user", description = "Update an existing user (Admin only)")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UserDto user = updateUserUseCase.execute(id, request);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete a user (Admin only)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        deleteUserUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/change-password")
    @Operation(summary = "Change user password", description = "Change password of a specific user")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        changeUserPasswordUseCase.execute(id, request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
