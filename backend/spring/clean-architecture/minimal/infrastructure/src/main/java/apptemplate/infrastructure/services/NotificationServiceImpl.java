package apptemplate.infrastructure.services;

import apptemplate.application.ports.repositories.NotificationRepository;
import apptemplate.application.ports.services.NotificationService;
import apptemplate.domain.entities.Notification;
import apptemplate.domain.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public void notifyUser(String userId, String title, String message, NotificationType type, String referenceId, String referenceType) {
        // Create and save notification
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .read(false)
                .build();

        notificationRepository.save(notification);
        log.debug("Notification created for user: {}", userId);
    }

    @Override
    @Transactional
    public void notifyUser(String userId, String title, String message, NotificationType type) {
        notifyUser(userId, title, message, type, null, null);
    }
}
