package apptemplate.application.ports.repositories;

import apptemplate.domain.entities.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Optional;


/**
 * Port interface for Notification repository operations.
 */
public interface NotificationRepository {

    Optional<Notification> findById(Long id);

    Page<Notification> findByUserId(Long userId, Boolean unreadOnly, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    long countUnreadByUserId(Long userId);

    Notification save(Notification notification);

    void markAsRead(Long id);

    void markAllAsRead(Long userId);

    void deleteById(Long id);
}
