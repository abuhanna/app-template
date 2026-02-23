package apptemplate.infrastructure.persistence.jpa;

import apptemplate.infrastructure.persistence.entities.NotificationJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;


@Repository
public interface NotificationJpaRepository extends JpaRepository<NotificationJpaEntity, Long> {

    @Query(value = "SELECT * FROM notifications n WHERE " +
           "n.user_id = :userId " +
           "AND (CAST(:unreadOnly AS BOOLEAN) IS NULL OR CAST(:unreadOnly AS BOOLEAN) = false OR n.is_read = false) " +
           "AND (CAST(:startDate AS TIMESTAMP) IS NULL OR n.created_at >= CAST(:startDate AS TIMESTAMP)) " +
           "AND (CAST(:endDate AS TIMESTAMP) IS NULL OR n.created_at <= CAST(:endDate AS TIMESTAMP)) " +
           "ORDER BY n.created_at DESC",
           countQuery = "SELECT COUNT(*) FROM notifications n WHERE " +
           "n.user_id = :userId " +
           "AND (CAST(:unreadOnly AS BOOLEAN) IS NULL OR CAST(:unreadOnly AS BOOLEAN) = false OR n.is_read = false) " +
           "AND (CAST(:startDate AS TIMESTAMP) IS NULL OR n.created_at >= CAST(:startDate AS TIMESTAMP)) " +
           "AND (CAST(:endDate AS TIMESTAMP) IS NULL OR n.created_at <= CAST(:endDate AS TIMESTAMP))",
           nativeQuery = true)
    Page<NotificationJpaEntity> findByUserId(
            @Param("userId") Long userId,
            @Param("unreadOnly") Boolean unreadOnly,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    long countByUserIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE NotificationJpaEntity n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id")
    void markAsRead(@Param("id") Long id, @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Query("UPDATE NotificationJpaEntity n SET n.isRead = true, n.readAt = :readAt WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsRead(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);
}
