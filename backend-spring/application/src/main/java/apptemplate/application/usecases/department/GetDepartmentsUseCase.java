package apptemplate.application.usecases.department;

import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.application.mappers.DepartmentMapper;
import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.domain.entities.Department;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetDepartmentsUseCase {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    // Map of allowed sort fields to actual entity field names
    private static final java.util.Map<String, String> SORT_FIELD_MAP = java.util.Map.of(
            "name", "name",
            "code", "code",
            "createdAt", "createdAt",
            "createdat", "createdAt",
            "isActive", "isActive",
            "isactive", "isActive"
    );

    @Transactional(readOnly = true)
    public Page<DepartmentDto> execute(String search, Boolean isActive,
                                        int page, int pageSize, String sortBy, String sortDir) {
        // Convert 1-based page to 0-based for Spring Data
        int zeroBasedPage = page - 1;

        // Build sorting
        Sort sort = buildSort(sortBy, sortDir);

        // Create pageable
        Pageable pageable = PageRequest.of(zeroBasedPage, pageSize, sort);

        Page<Department> departments = departmentRepository.findByFilters(search, isActive, pageable);
        return departments.map(departmentMapper::toDto);
    }

    private Sort buildSort(String sortBy, String sortDir) {
        if (sortBy == null || sortBy.isBlank()) {
            // Default sort by name ascending
            return Sort.by(Sort.Direction.ASC, "name");
        }

        // Map the sort field to actual entity field
        String actualField = SORT_FIELD_MAP.getOrDefault(sortBy.toLowerCase(), sortBy);

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir)
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;

        return Sort.by(direction, actualField);
    }
}
