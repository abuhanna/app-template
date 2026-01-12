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

    @Query("SELECT n FROM NotificationJpaEntity n WHERE " +
           "n.userId = :userId " +
           "AND (:unreadOnly IS NULL OR :unreadOnly = false OR n.isRead = false) " +
           "ORDER BY n.createdAt DESC")
    Page<NotificationJpaEntity> findByUserId(
            @Param("userId") Long userId,
            @Param("unreadOnly") Boolean unreadOnly,
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
