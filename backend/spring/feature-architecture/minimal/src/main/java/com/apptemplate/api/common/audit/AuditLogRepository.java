package com.apptemplate.api.common.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:search IS NULL OR LOWER(a.entityName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(a.userName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:entityName IS NULL OR a.entityName = :entityName) " +
           "AND (:action IS NULL OR a.action = :action) " +
           "AND (:userId IS NULL OR a.userId = :userId) " +
           "AND (:fromDate IS NULL OR a.createdAt >= :fromDate) " +
           "AND (:toDate IS NULL OR a.createdAt <= :toDate)")
    Page<AuditLog> findWithFilters(
            @Param("search") String search,
            @Param("entityName") String entityName,
            @Param("action") String action,
            @Param("userId") String userId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );
}
