package apptemplate.application.usecases.department;

import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.domain.entities.Department;
import apptemplate.domain.exceptions.BusinessException;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class DeleteDepartmentUseCase {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public void execute(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department", id));

        // Check if any users are assigned to this department
        long userCount = userRepository.countByDepartmentId(id);
        if (userCount > 0) {
            throw new BusinessException(
                    String.format("Cannot delete department. %d user(s) are assigned to this department.", userCount)
            );
        }

        departmentRepository.delete(department);
    }
}
