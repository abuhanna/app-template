package apptemplate.application.usecases.department;

import apptemplate.application.dto.department.CreateDepartmentRequest;
import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.application.mappers.DepartmentMapper;
import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.domain.entities.Department;
import apptemplate.domain.exceptions.ConflictException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateDepartmentUseCase {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    @Transactional
    public DepartmentDto execute(CreateDepartmentRequest request) {
        // Check code uniqueness
        departmentRepository.findByCode(request.getCode())
                .ifPresent(existing -> {
                    throw new ConflictException("Department code already exists");
                });

        // Create department
        Department department = Department.builder()
                .code(request.getCode().toUpperCase())
                .name(request.getName())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        departmentRepository.save(department);

        return departmentMapper.toDto(department);
    }
}
