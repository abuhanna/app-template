package com.apptemplate.api.service;

import com.apptemplate.api.dto.CreateDepartmentRequest;
import com.apptemplate.api.dto.DepartmentDto;
import com.apptemplate.api.dto.UpdateDepartmentRequest;
import com.apptemplate.api.exception.ConflictException;
import com.apptemplate.api.exception.NotFoundException;
import com.apptemplate.api.model.Department;
import com.apptemplate.api.repository.DepartmentRepository;
import com.apptemplate.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public Page<DepartmentDto> getDepartments(String search, Boolean isActive,
                                               int page, int pageSize,
                                               String sortBy, String sortOrder) {
        Sort sort = buildSort(sortBy, sortOrder, "name");
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Page<Department> departments = departmentRepository.findAllWithFilters(search, isActive, pageable);
        return departments.map(this::mapToDto);
    }

    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department", id));
        return mapToDto(department);
    }

    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest request) {
        if (departmentRepository.existsByCode(request.getCode())) {
            throw new ConflictException("Department with code '" + request.getCode() + "' already exists");
        }

        Department department = new Department();
        department.setCode(request.getCode());
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setActive(true);

        Department saved = departmentRepository.save(department);

        auditLogService.log("create", "Department", saved.getId().toString(),
                null, null, "Department created: " + saved.getName(), null);

        return mapToDto(saved);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, UpdateDepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department", id));

        if (request.getCode() != null) {
            if (!request.getCode().equals(department.getCode()) && departmentRepository.existsByCode(request.getCode())) {
                throw new ConflictException("Department with code '" + request.getCode() + "' already exists");
            }
            department.setCode(request.getCode());
        }
        if (request.getName() != null) {
            department.setName(request.getName());
        }
        if (request.getDescription() != null) {
            department.setDescription(request.getDescription());
        }
        if (request.getIsActive() != null) {
            department.setActive(request.getIsActive());
        }

        Department saved = departmentRepository.save(department);

        auditLogService.log("update", "Department", saved.getId().toString(),
                null, null, "Department updated: " + saved.getName(), null);

        return mapToDto(saved);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department", id));

        departmentRepository.delete(department);

        auditLogService.log("delete", "Department", id.toString(),
                null, null, "Department deleted: " + department.getName(), null);
    }

    private DepartmentDto mapToDto(Department department) {
        long userCount = userRepository.countByDepartmentId(department.getId());

        return DepartmentDto.builder()
                .id(department.getId())
                .code(department.getCode())
                .name(department.getName())
                .description(department.getDescription())
                .isActive(department.isActive())
                .userCount(userCount)
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .build();
    }

    private Sort buildSort(String sortBy, String sortOrder, String defaultSortBy) {
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : defaultSortBy;
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, field);
    }
}
