package apptemplate.infrastructure.persistence.jpa;

import apptemplate.infrastructure.persistence.entities.DepartmentJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface DepartmentJpaRepository extends JpaRepository<DepartmentJpaEntity, Long> {

    Optional<DepartmentJpaEntity> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("SELECT d FROM DepartmentJpaEntity d WHERE " +
           "(:search IS NULL OR LOWER(d.code) LIKE LOWER(CAST(:search AS string)) " +
           "OR LOWER(d.name) LIKE LOWER(CAST(:search AS string))) " +
           "AND (:isActive IS NULL OR d.isActive = :isActive)")
    Page<DepartmentJpaEntity> findByFilters(
            @Param("search") String search,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}
