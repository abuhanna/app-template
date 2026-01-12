package apptemplate.application.usecases.department;

import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.application.mappers.DepartmentMapper;
import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.domain.entities.Department;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetDepartmentsUseCase {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    @Transactional(readOnly = true)
    public Page<DepartmentDto> execute(String search, Boolean isActive, Pageable pageable) {
        Page<Department> departments = departmentRepository.findByFilters(search, isActive, pageable);
        return departments.map(departmentMapper::toDto);
    }
}
