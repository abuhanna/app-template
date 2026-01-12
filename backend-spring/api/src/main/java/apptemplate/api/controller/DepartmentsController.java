package apptemplate.api.controller;

import apptemplate.api.dto.ApiResponse;
import apptemplate.api.dto.PagedResponse;
import apptemplate.application.dto.department.CreateDepartmentRequest;
import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.application.dto.department.UpdateDepartmentRequest;
import apptemplate.application.usecases.department.*;
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
    public ResponseEntity<ApiResponse<PagedResponse<DepartmentDto>>> getDepartments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<DepartmentDto> departments = getDepartmentsUseCase.execute(search, isActive, pageable);
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(departments)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID", description = "Get a specific department by its ID")
    public ResponseEntity<ApiResponse<DepartmentDto>> getDepartmentById(@PathVariable Long id) {
        DepartmentDto department = getDepartmentByIdUseCase.execute(id);
        return ResponseEntity.ok(ApiResponse.success(department));
    }

    @PostMapping
    @Operation(summary = "Create department", description = "Create a new department")
    public ResponseEntity<ApiResponse<DepartmentDto>> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        DepartmentDto department = createDepartmentUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(department, "Department created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update department", description = "Update an existing department")
    public ResponseEntity<ApiResponse<DepartmentDto>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDepartmentRequest request
    ) {
        DepartmentDto department = updateDepartmentUseCase.execute(id, request);
        return ResponseEntity.ok(ApiResponse.success(department, "Department updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete department", description = "Delete a department")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        deleteDepartmentUseCase.execute(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Department deleted successfully"));
    }
}
