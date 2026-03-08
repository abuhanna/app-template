package apptemplate.application.usecases.department;

import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.application.mappers.DepartmentMapper;
import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.domain.entities.Department;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetDepartmentByIdUseCase {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final DepartmentMapper departmentMapper;

    @Transactional(readOnly = true)
    public DepartmentDto execute(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department", id));

        DepartmentDto dto = departmentMapper.toDto(department);
        dto.setUserCount(userRepository.countByDepartmentId(id));
        return dto;
    }
}
