package apptemplate.infrastructure.persistence.jpa;

import apptemplate.infrastructure.persistence.entities.AuditLogJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogJpaRepository extends JpaRepository<AuditLogJpaEntity, Long> {

    @Query("SELECT a FROM AuditLogJpaEntity a WHERE " +
           "(:search IS NULL OR " +
           "    LOWER(a.entityName) LIKE LOWER(CAST(:search AS string)) OR " +
           "    LOWER(a.entityId) LIKE LOWER(CAST(:search AS string)) OR " +
           "    LOWER(a.action) LIKE LOWER(CAST(:search AS string))) AND " +
           "(:entityName IS NULL OR a.entityName = :entityName) AND " +
           "(:entityId IS NULL OR a.entityId = :entityId) AND " +
           "(:userId IS NULL OR a.userId = :userId) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(CAST(:fromDate AS timestamp) IS NULL OR a.timestamp >= :fromDate) AND " +
           "(CAST(:toDate AS timestamp) IS NULL OR a.timestamp <= :toDate)")
    Page<AuditLogJpaEntity> findByFilters(
        @Param("search") String search,
        @Param("entityName") String entityName,
        @Param("entityId") String entityId,
        @Param("userId") Long userId,
        @Param("action") String action,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        Pageable pageable
    );
}
