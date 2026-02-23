package apptemplate.application.usecases.notification;

import apptemplate.application.dto.notification.NotificationDto;
import apptemplate.application.mappers.NotificationMapper;
import apptemplate.application.ports.repositories.NotificationRepository;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.domain.entities.Notification;
import apptemplate.domain.exceptions.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class GetUserNotificationsUseCase {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;
    private final NotificationMapper notificationMapper;

    @Transactional(readOnly = true)
    public Page<NotificationDto> execute(Boolean unreadOnly, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Long userId = currentUserService.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationException("User not authenticated"));

        Page<Notification> notifications = notificationRepository.findByUserId(userId, unreadOnly, startDate, endDate, pageable);
        return notifications.map(notificationMapper::toDto);
    }
}
