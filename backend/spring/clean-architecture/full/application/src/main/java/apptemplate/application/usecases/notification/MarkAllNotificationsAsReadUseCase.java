package apptemplate.application.usecases.notification;

import apptemplate.application.ports.repositories.NotificationRepository;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.domain.exceptions.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class MarkAllNotificationsAsReadUseCase {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public void execute() {
        Long userId = currentUserService.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationException("User not authenticated"));

        notificationRepository.markAllAsRead(userId);
    }
}
