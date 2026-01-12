package apptemplate.infrastructure.persistence.jpa;

import apptemplate.infrastructure.persistence.entities.UserJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, UUID> {

    Optional<UserJpaEntity> findByUsername(String username);

    Optional<UserJpaEntity> findByEmail(String email);

    Optional<UserJpaEntity> findByPasswordResetToken(String token);

    List<UserJpaEntity> findByRole(String role);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsernameAndIdNot(String username, UUID id);

    boolean existsByEmailAndIdNot(String email, UUID id);

    long countByDepartmentId(UUID departmentId);

    @Query("SELECT u FROM UserJpaEntity u WHERE " +
           "(:search IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:departmentId IS NULL OR u.departmentId = :departmentId) " +
           "AND (:isActive IS NULL OR u.isActive = :isActive)")
    Page<UserJpaEntity> findByFilters(
            @Param("search") String search,
            @Param("departmentId") UUID departmentId,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}
