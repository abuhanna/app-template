package com.apptemplate.api.features.users;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    long countByDepartmentId(Long departmentId);

    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:isActive IS NULL OR u.isActive = :isActive) " +
           "AND (:departmentId IS NULL OR u.departmentId = :departmentId)")
    Page<User> findWithFilters(
            @Param("search") String search,
            @Param("isActive") Boolean isActive,
            @Param("departmentId") Long departmentId,
            Pageable pageable
    );
}
