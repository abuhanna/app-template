package apptemplate.application.ports.repositories;

import apptemplate.domain.entities.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

/**
 * Port interface for Notification repository operations.
 */
public interface NotificationRepository {

    Optional<Notification> findById(UUID id);

    Page<Notification> findByUserId(UUID userId, Boolean unreadOnly, Pageable pageable);

    long countUnreadByUserId(UUID userId);

    Notification save(Notification notification);

    void markAsRead(UUID id);

    void markAllAsRead(UUID userId);

    void deleteById(UUID id);
}
