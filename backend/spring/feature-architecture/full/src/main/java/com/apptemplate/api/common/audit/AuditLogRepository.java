package com.apptemplate.api.common.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:search IS NULL OR LOWER(a.entityType) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(a.userName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:entityType IS NULL OR a.entityType = :entityType) " +
           "AND (:entityId IS NULL OR a.entityId = :entityId) " +
           "AND (:userId IS NULL OR a.userId = :userId) " +
           "AND (:action IS NULL OR a.action = :action) " +
           "AND (:fromDate IS NULL OR a.createdAt >= :fromDate) " +
           "AND (:toDate IS NULL OR a.createdAt <= :toDate)")
    Page<AuditLog> findWithFilters(
            @Param("search") String search,
            @Param("entityType") String entityType,
            @Param("entityId") String entityId,
            @Param("userId") Long userId,
            @Param("action") String action,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );
}
