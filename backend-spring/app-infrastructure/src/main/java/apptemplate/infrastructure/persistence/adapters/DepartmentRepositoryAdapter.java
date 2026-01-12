package apptemplate.infrastructure.persistence.adapters;

import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.domain.entities.Department;
import apptemplate.infrastructure.persistence.entities.DepartmentJpaEntity;
import apptemplate.infrastructure.persistence.jpa.DepartmentJpaRepository;
import apptemplate.infrastructure.persistence.mappers.DepartmentEntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class DepartmentRepositoryAdapter implements DepartmentRepository {

    private final DepartmentJpaRepository jpaRepository;
    private final DepartmentEntityMapper mapper;

    @Override
    public Optional<Department> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Department> findByCode(String code) {
        return jpaRepository.findByCode(code).map(mapper::toDomain);
    }

    @Override
    public List<Department> findAll() {
        return jpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<Department> findByFilters(String search, Boolean isActive, Pageable pageable) {
        return jpaRepository.findByFilters(search, isActive, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByCode(String code) {
        return jpaRepository.existsByCode(code);
    }

    @Override
    public boolean existsByCodeAndIdNot(String code, UUID id) {
        return jpaRepository.existsByCodeAndIdNot(code, id);
    }

    @Override
    public Department save(Department department) {
        DepartmentJpaEntity entity;
        if (department.getId() != null) {
            entity = jpaRepository.findById(department.getId())
                    .orElse(mapper.toJpaEntity(department));
            mapper.updateJpaEntity(department, entity);
        } else {
            entity = mapper.toJpaEntity(department);
        }
        DepartmentJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void delete(Department department) {
        jpaRepository.deleteById(department.getId());
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
