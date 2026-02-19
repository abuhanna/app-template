package apptemplate.application.usecases.department;

import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.application.dto.department.UpdateDepartmentRequest;
import apptemplate.application.mappers.DepartmentMapper;
import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.domain.entities.Department;
import apptemplate.domain.exceptions.ConflictException;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class UpdateDepartmentUseCase {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    @Transactional
    public DepartmentDto execute(Long id, UpdateDepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department", id));

        // Check code uniqueness if changed
        if (request.getCode() != null && !department.getCode().equalsIgnoreCase(request.getCode())) {
            departmentRepository.findByCode(request.getCode())
                    .ifPresent(existing -> {
                        throw new ConflictException("Department code already exists");
                    });
            department.updateCode(request.getCode().toUpperCase());
        }

        // Update department information
        department.update(
            request.getName() != null ? request.getName() : department.getName(),
            request.getDescription() != null ? request.getDescription() : department.getDescription()
        );

        // Update active status
        if (request.getIsActive() != null) {
            department.setActiveStatus(request.getIsActive());
        }

        departmentRepository.save(department);

        return departmentMapper.toDto(department);
    }
}
