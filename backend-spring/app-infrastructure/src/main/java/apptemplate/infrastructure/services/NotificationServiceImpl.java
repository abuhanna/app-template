package apptemplate.infrastructure.services;

import apptemplate.application.ports.repositories.NotificationRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.application.ports.services.NotificationService;
import apptemplate.domain.entities.Notification;
import apptemplate.domain.enums.NotificationType;
import apptemplate.domain.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void notifyUser(UUID userId, String title, String message, NotificationType type, String link) {
        // Create and save notification
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Send via WebSocket
        sendWebSocketNotification(userId, saved);
    }

    @Override
    @Transactional
    public void notifyAdmins(String title, String message, NotificationType type, String link) {
        userRepository.findByRole(UserRole.ADMIN.name()).forEach(admin -> {
            notifyUser(admin.getId(), title, message, type, link);
        });
    }

    private void sendWebSocketNotification(UUID userId, Notification notification) {
        try {
            Map<String, Object> payload = Map.of(
                    "id", notification.getId(),
                    "title", notification.getTitle(),
                    "message", notification.getMessage(),
                    "type", notification.getType().name(),
                    "link", notification.getLink() != null ? notification.getLink() : "",
                    "isRead", notification.isRead(),
                    "createdAt", notification.getCreatedAt().toString()
            );

            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    payload
            );

            log.debug("WebSocket notification sent to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification to user: {}", userId, e);
        }
    }
}
