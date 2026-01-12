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
        if (!department.getCode().equalsIgnoreCase(request.getCode())) {
            departmentRepository.findByCode(request.getCode())
                    .ifPresent(existing -> {
                        throw new ConflictException("Department code already exists");
                    });
        }

        // Update department
        department.updateCode(request.getCode().toUpperCase());
        department.update(
                request.getName(),
                request.getDescription()
        );
        department.setActiveStatus(request.getActive());

        departmentRepository.save(department);

        return departmentMapper.toDto(department);
    }
}
