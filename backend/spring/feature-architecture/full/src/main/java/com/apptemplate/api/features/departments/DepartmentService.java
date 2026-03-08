package com.apptemplate.api.features.departments;

import com.apptemplate.api.common.exception.ConflictException;
import com.apptemplate.api.common.exception.NotFoundException;
import com.apptemplate.api.features.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<DepartmentDto> getDepartments(String search, Boolean isActive,
                                               int page, int pageSize, String sortBy, String sortOrder) {
        Sort sort = buildSort(sortBy, sortOrder, "name");
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, sort);
        return departmentRepository.findWithFilters(search, isActive, pageRequest)
                .map(dept -> DepartmentDto.fromEntity(dept, userRepository.countByDepartmentId(dept.getId())));
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department not found with id " + id));
        long userCount = userRepository.countByDepartmentId(id);
        return DepartmentDto.fromEntity(department, userCount);
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
        return DepartmentDto.fromEntity(saved, 0);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, UpdateDepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department not found with id " + id));

        if (request.getName() != null) department.setName(request.getName());
        if (request.getDescription() != null) department.setDescription(request.getDescription());
        if (request.getIsActive() != null) department.setActive(request.getIsActive());

        Department saved = departmentRepository.save(department);
        long userCount = userRepository.countByDepartmentId(id);
        return DepartmentDto.fromEntity(saved, userCount);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new NotFoundException("Department not found with id " + id);
        }
        departmentRepository.deleteById(id);
    }

    private Sort buildSort(String sortBy, String sortOrder, String defaultSortBy) {
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : defaultSortBy;
        return "asc".equalsIgnoreCase(sortOrder) ? Sort.by(field).ascending() : Sort.by(field).descending();
    }
}
