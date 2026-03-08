package com.apptemplate.api.service;

import com.apptemplate.api.dto.NotificationDto;
import com.apptemplate.api.exception.NotFoundException;
import com.apptemplate.api.model.Notification;
import com.apptemplate.api.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Page<NotificationDto> getNotifications(Long userId, boolean unreadOnly,
                                                   int page, int pageSize,
                                                   String sortBy, String sortOrder) {
        Sort sort = buildSort(sortBy, sortOrder, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Page<Notification> notifications = notificationRepository.findByUserIdWithFilters(
                userId, unreadOnly, pageable);
        return notifications.map(this::mapToDto);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification", notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new NotFoundException("Notification", notificationId);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification", notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new NotFoundException("Notification", notificationId);
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

    private Sort buildSort(String sortBy, String sortOrder, String defaultSortBy) {
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : defaultSortBy;
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, field);
    }
}
