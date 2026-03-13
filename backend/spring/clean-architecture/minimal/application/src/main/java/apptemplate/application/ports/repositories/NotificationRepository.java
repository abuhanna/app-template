package apptemplate.application.ports.repositories;

import apptemplate.domain.entities.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;


/**
 * Port interface for Notification repository operations.
 * In minimal variant, userId is a String (from JWT claims, no users table).
 */
public interface NotificationRepository {

    Optional<Notification> findById(Long id);

    Page<Notification> findByUserId(String userId, Boolean unreadOnly, Pageable pageable);

    long countUnreadByUserId(String userId);

    Notification save(Notification notification);

    void markAsRead(Long id);

    void markAllAsRead(String userId);

    void deleteById(Long id);
}
