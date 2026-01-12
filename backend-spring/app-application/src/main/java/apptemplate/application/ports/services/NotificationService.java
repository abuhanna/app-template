package apptemplate.application.ports.services;

import apptemplate.domain.enums.NotificationType;

/**
 * Port interface for notification operations.
 */
public interface NotificationService {

    /**
     * Sends a notification to a specific user.
     */
    void notifyUser(Long userId, String title, String message, NotificationType type,
                    String referenceId, String referenceType);

    /**
     * Sends a notification to a specific user (simple version).
     */
    void notifyUser(Long userId, String title, String message, NotificationType type);

    /**
     * Sends a notification to all admin users.
     */
    void notifyAdmins(String title, String message, NotificationType type,
                      String referenceId, String referenceType);

    /**
     * Sends a notification to all admin users (simple version).
     */
    void notifyAdmins(String title, String message, NotificationType type);
}
