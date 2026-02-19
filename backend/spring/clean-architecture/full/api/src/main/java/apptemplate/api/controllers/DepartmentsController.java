package apptemplate.api.controllers;

import apptemplate.api.dto.ApiResponse;
import apptemplate.api.dto.PagedResponse;
import apptemplate.application.dto.department.CreateDepartmentRequest;
import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.application.dto.department.UpdateDepartmentRequest;
import apptemplate.application.usecases.department.*;
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



@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Departments", description = "Department management endpoints (Admin only)")
public class DepartmentsController {

    private final GetDepartmentsUseCase getDepartmentsUseCase;
    private final GetDepartmentByIdUseCase getDepartmentByIdUseCase;
    private final CreateDepartmentUseCase createDepartmentUseCase;
    private final UpdateDepartmentUseCase updateDepartmentUseCase;
    private final DeleteDepartmentUseCase deleteDepartmentUseCase;

    @GetMapping
    @Operation(summary = "Get all departments", description = "Get paginated list of departments with optional filters")
    public ResponseEntity<PagedResponse<DepartmentDto>> getDepartments(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Column to sort by (e.g., name, code, createdAt)") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "asc") String sortDir,
            @Parameter(description = "Search by name or code") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by active status") @RequestParam(required = false) Boolean isActive
    ) {
        // Ensure page is at least 1 and cap pageSize at 100
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        Page<DepartmentDto> departments = getDepartmentsUseCase.execute(search, isActive, page, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(PagedResponse.from(departments));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID", description = "Get a specific department by its ID")
    public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable Long id) {
        DepartmentDto department = getDepartmentByIdUseCase.execute(id);
        return ResponseEntity.ok(department);
    }

    @PostMapping
    @Operation(summary = "Create department", description = "Create a new department")
    public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        DepartmentDto department = createDepartmentUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(department);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update department", description = "Update an existing department")
    public ResponseEntity<DepartmentDto> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDepartmentRequest request
    ) {
        DepartmentDto department = updateDepartmentUseCase.execute(id, request);
        return ResponseEntity.ok(department);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete department", description = "Delete a department")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        deleteDepartmentUseCase.execute(id);
        return ResponseEntity.ok().build();
    }
}
