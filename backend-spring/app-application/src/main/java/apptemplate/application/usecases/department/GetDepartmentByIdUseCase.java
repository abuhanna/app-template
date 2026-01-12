package apptemplate.application.usecases.department;

import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.application.mappers.DepartmentMapper;
import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.domain.entities.Department;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetDepartmentByIdUseCase {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    @Transactional(readOnly = true)
    public DepartmentDto execute(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department", id));

        return departmentMapper.toDto(department);
    }
}
