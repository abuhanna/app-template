package apptemplate.application.usecases.notification;

import apptemplate.application.ports.repositories.NotificationRepository;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.domain.entities.Notification;
import apptemplate.domain.exceptions.AuthenticationException;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MarkNotificationAsReadUseCase {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public void execute(UUID notificationId) {
        UUID userId = currentUserService.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationException("User not authenticated"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification", notificationId));

        // Ensure user owns this notification
        if (!notification.getUserId().equals(userId)) {
            throw new NotFoundException("Notification", notificationId);
        }

        notification.markAsRead();
        notificationRepository.save(notification);
    }
}
