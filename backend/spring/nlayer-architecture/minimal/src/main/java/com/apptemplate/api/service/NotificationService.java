package com.apptemplate.api.service;

import com.apptemplate.api.dto.NotificationDto;
import com.apptemplate.api.exception.NotFoundException;
import com.apptemplate.api.model.Notification;
import com.apptemplate.api.model.User;
import com.apptemplate.api.repository.NotificationRepository;
import com.apptemplate.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(boolean unreadOnly, int page, int pageSize,
                                                    String sortBy, String sortOrder) {
        Long userId = getCurrentUserId();
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : "createdAt";
        Sort sort = "asc".equalsIgnoreCase(sortOrder) ? Sort.by(field).ascending() : Sort.by(field).descending();
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, sort);

        Page<Notification> notifications;
        if (unreadOnly) {
            notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageRequest);
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageRequest);
        }
        return notifications.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByUserIdAndIsReadFalse(getCurrentUserId());
    }

    @Transactional
    public void markAsRead(Long id) {
        Long userId = getCurrentUserId();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification", id));

        if (!notification.getUserId().equals(userId)) {
            throw new NotFoundException("Notification", id);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAsReadByUserId(getCurrentUserId());
    }

    @Transactional
    public void deleteNotification(Long id) {
        Long userId = getCurrentUserId();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification", id));

        if (!notification.getUserId().equals(userId)) {
            throw new NotFoundException("Notification", id);
        }

        notificationRepository.delete(notification);
    }

    private NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User", "email", email));
        return user.getId();
    }
}
