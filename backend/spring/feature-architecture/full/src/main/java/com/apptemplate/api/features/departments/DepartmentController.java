package com.apptemplate.api.features.departments;

import com.apptemplate.api.common.dto.ApiResponse;
import com.apptemplate.api.common.dto.PagedResult;
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
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Department management APIs")
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    @Operation(summary = "Get all departments", description = "Get paginated list of departments with optional filters")
    public ResponseEntity<ApiResponse<PagedResult<DepartmentDto>>> getAllDepartments(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Search by name or code") @RequestParam(required = false) String search,
            @Parameter(description = "Column to sort by") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort order: asc or desc") @RequestParam(defaultValue = "desc") String sortOrder,
            @Parameter(description = "Filter by active status") @RequestParam(required = false) Boolean isActive
    ) {
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        Page<DepartmentDto> departments = departmentService.getDepartments(search, isActive, page, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(ApiResponse.success(PagedResult.fromPage(departments), "Departments retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<ApiResponse<DepartmentDto>> getDepartmentById(@PathVariable Long id) {
        DepartmentDto department = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(ApiResponse.success(department));
    }

    @PostMapping
    @Operation(summary = "Create department", description = "Create a new department (Admin only)")
    public ResponseEntity<ApiResponse<DepartmentDto>> createDepartment(
            @Valid @RequestBody CreateDepartmentRequest request) {
        DepartmentDto department = departmentService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(department, "Department created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update department", description = "Update an existing department (Admin only)")
    public ResponseEntity<ApiResponse<DepartmentDto>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDepartmentRequest request) {
        DepartmentDto department = departmentService.updateDepartment(id, request);
        return ResponseEntity.ok(ApiResponse.success(department, "Department updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete department", description = "Delete a department (Admin only)")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
