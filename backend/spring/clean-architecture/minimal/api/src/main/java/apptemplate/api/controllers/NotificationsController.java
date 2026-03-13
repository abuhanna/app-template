package apptemplate.api.controllers;

import apptemplate.api.dto.ApiResponse;
import apptemplate.api.dto.PagedResponse;
import apptemplate.application.dto.notification.NotificationDto;
import apptemplate.application.usecases.notification.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;



@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationsController {

    private final GetUserNotificationsUseCase getUserNotificationsUseCase;
    private final GetUnreadNotificationCountUseCase getUnreadNotificationCountUseCase;
    private final MarkNotificationAsReadUseCase markNotificationAsReadUseCase;
    private final MarkAllNotificationsAsReadUseCase markAllNotificationsAsReadUseCase;
    private final DeleteNotificationUseCase deleteNotificationUseCase;

    @GetMapping
    @Operation(summary = "Get my notifications", description = "Get paginated list of notifications for authenticated user")
    public ResponseEntity<PagedResponse<NotificationDto>> getNotifications(
            @RequestParam(required = false, defaultValue = "false") Boolean unreadOnly,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<NotificationDto> notifications = getUserNotificationsUseCase.execute(unreadOnly, pageable);
        return ResponseEntity.ok(PagedResponse.from(notifications));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count", description = "Get count of unread notifications for authenticated user")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = getUnreadNotificationCountUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count), "Unread count retrieved successfully"));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Mark a specific notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        markNotificationAsReadUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead() {
        markAllNotificationsAsReadUseCase.execute();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification", description = "Delete a specific notification")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        deleteNotificationUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }
}
