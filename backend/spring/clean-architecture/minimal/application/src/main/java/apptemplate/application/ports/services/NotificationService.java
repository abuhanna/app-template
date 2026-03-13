package apptemplate.application.ports.services;

import apptemplate.domain.enums.NotificationType;

/**
 * Port interface for notification operations.
 * In minimal variant, userId is a String (from JWT claims, no users table).
 */
public interface NotificationService {

    /**
     * Sends a notification to a specific user.
     */
    void notifyUser(String userId, String title, String message, NotificationType type,
                    String referenceId, String referenceType);

    /**
     * Sends a notification to a specific user (simple version).
     */
    void notifyUser(String userId, String title, String message, NotificationType type);
}
