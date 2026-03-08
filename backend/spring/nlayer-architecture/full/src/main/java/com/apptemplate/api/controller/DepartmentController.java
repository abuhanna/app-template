package com.apptemplate.api.controller;

import com.apptemplate.api.dto.*;
import com.apptemplate.api.service.DepartmentService;
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
    public ResponseEntity<PagedResult<DepartmentDto>> getAllDepartments(
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
        return ResponseEntity.ok(PagedResult.from(departments));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<ApiResponse<DepartmentDto>> getDepartmentById(@PathVariable Long id) {
        DepartmentDto department = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(ApiResponse.success(department));
    }

    @PostMapping
    @Operation(summary = "Create new department")
    public ResponseEntity<ApiResponse<DepartmentDto>> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        DepartmentDto created = departmentService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Department created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update department")
    public ResponseEntity<ApiResponse<DepartmentDto>> updateDepartment(
            @PathVariable Long id, @RequestBody UpdateDepartmentRequest request) {
        DepartmentDto updated = departmentService.updateDepartment(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Department updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete department")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
