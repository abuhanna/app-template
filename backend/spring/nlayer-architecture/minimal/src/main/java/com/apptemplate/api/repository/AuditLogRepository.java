package com.apptemplate.api.repository;

import com.apptemplate.api.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:search IS NULL OR LOWER(a.tableName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(a.type) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(a.userId) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:tableName IS NULL OR a.tableName = :tableName) " +
           "AND (:type IS NULL OR a.type = :type) " +
           "AND (:userId IS NULL OR a.userId = :userId) " +
           "AND (:fromDate IS NULL OR a.dateTime >= :fromDate) " +
           "AND (:toDate IS NULL OR a.dateTime <= :toDate)")
    Page<AuditLog> findWithFilters(
            @Param("search") String search,
            @Param("tableName") String tableName,
            @Param("type") String type,
            @Param("userId") String userId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );
}
