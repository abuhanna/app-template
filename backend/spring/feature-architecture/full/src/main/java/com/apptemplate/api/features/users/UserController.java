package com.apptemplate.api.features.users;

import com.apptemplate.api.common.dto.ApiResponse;
import com.apptemplate.api.common.dto.PagedResult;
import com.apptemplate.api.features.users.dto.CreateUserRequest;
import com.apptemplate.api.features.users.dto.UpdateUserRequest;
import com.apptemplate.api.features.users.dto.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users", description = "Get paginated list of users with optional filters")
    public ResponseEntity<ApiResponse<PagedResult<UserDto>>> getAllUsers(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Search by username, email, or name") @RequestParam(required = false) String search,
            @Parameter(description = "Column to sort by") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort order: asc or desc") @RequestParam(defaultValue = "desc") String sortOrder,
            @Parameter(description = "Filter by active status") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Filter by department ID") @RequestParam(required = false) Long departmentId
    ) {
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        Page<UserDto> users = userService.getUsers(search, isActive, departmentId, page, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(ApiResponse.success(PagedResult.fromPage(users), "Users retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping
    @Operation(summary = "Create new user", description = "Create a new user (Admin only)")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDto createdUser = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdUser, "User created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Update an existing user (Admin only)")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserDto updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "User updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Soft-delete a user (Admin only)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
