package com.apptemplate.api.features.notifications;

import com.apptemplate.api.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(boolean unreadOnly, int page, int pageSize,
                                                   String sortBy, String sortOrder) {
        String userId = getCurrentUserId();
        Sort sort = buildSort(sortBy, sortOrder, "createdAt");
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, sort);

        Page<Notification> notifications;
        if (unreadOnly) {
            notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageRequest);
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageRequest);
        }
        return notifications.map(NotificationDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        String userId = getCurrentUserId();
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found with id " + id));
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        String userId = getCurrentUserId();
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new NotFoundException("Notification not found with id " + id);
        }
        notificationRepository.deleteById(id);
    }

    private String getCurrentUserId() {
        try {
            Object credentials = SecurityContextHolder.getContext().getAuthentication().getCredentials();
            if (credentials instanceof String && !"".equals(credentials)) {
                return (String) credentials;
            }
        } catch (Exception ignored) {
        }
        // Fallback: use authentication name
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private Sort buildSort(String sortBy, String sortOrder, String defaultSortBy) {
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : defaultSortBy;
        return "asc".equalsIgnoreCase(sortOrder) ? Sort.by(field).ascending() : Sort.by(field).descending();
    }
}
