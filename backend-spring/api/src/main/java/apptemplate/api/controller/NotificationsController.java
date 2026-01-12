package apptemplate.api.controller;

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



@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationsController {

    private final GetUserNotificationsUseCase getUserNotificationsUseCase;
    private final MarkNotificationAsReadUseCase markNotificationAsReadUseCase;
    private final MarkAllNotificationsAsReadUseCase markAllNotificationsAsReadUseCase;

    @GetMapping
    @Operation(summary = "Get my notifications", description = "Get paginated list of notifications for authenticated user")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationDto>>> getNotifications(
            @RequestParam(required = false, defaultValue = "false") Boolean unreadOnly,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<NotificationDto> notifications = getUserNotificationsUseCase.execute(unreadOnly, pageable);
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(notifications)));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Mark a specific notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        markNotificationAsReadUseCase.execute(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        markAllNotificationsAsReadUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }
}
