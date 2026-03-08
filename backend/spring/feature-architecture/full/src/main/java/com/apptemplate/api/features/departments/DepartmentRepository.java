package com.apptemplate.api.features.departments;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByCode(String code);

    boolean existsByCode(String code);

    @Query("SELECT d FROM Department d WHERE " +
           "(:search IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(d.code) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:isActive IS NULL OR d.isActive = :isActive)")
    Page<Department> findWithFilters(
            @Param("search") String search,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}
