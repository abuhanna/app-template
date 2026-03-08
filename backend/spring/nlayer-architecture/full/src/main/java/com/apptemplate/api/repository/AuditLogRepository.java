package com.apptemplate.api.repository;

import com.apptemplate.api.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:search IS NULL OR LOWER(a.entityType) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.userName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.details) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:entityType IS NULL OR a.entityType = :entityType) " +
           "AND (:action IS NULL OR a.action = :action) " +
           "AND (:userId IS NULL OR a.userId = :userId)")
    Page<AuditLog> findAllWithFilters(
            @Param("search") String search,
            @Param("entityType") String entityType,
            @Param("action") String action,
            @Param("userId") Long userId,
            Pageable pageable);
}
