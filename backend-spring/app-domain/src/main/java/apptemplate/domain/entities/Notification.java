package apptemplate.domain.entities;

import apptemplate.domain.enums.NotificationType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Notification entity for real-time notifications.
 */
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
    private String referenceId;
    private String referenceType;
    private boolean read;
    private LocalDateTime createdAt;

    /**
     * Creates a new notification.
     */
    public Notification(Long userId, String title, String message, NotificationType type,
                        String referenceId, String referenceType) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Marks notification as read.
     */
    public void markAsRead() {
        this.read = true;
    }
}
