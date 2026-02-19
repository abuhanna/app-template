package apptemplate.application.ports.repositories;

import apptemplate.domain.entities.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;


/**
 * Port interface for Department repository operations.
 */
public interface DepartmentRepository {

    Optional<Department> findById(Long id);

    Optional<Department> findByCode(String code);

    List<Department> findAll();

    Page<Department> findByFilters(String search, Boolean isActive, Pageable pageable);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    Department save(Department department);

    void delete(Department department);

    void deleteById(Long id);
}
