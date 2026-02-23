package apptemplate.api.controllers;

import apptemplate.api.dto.PagedResponse;
import apptemplate.application.dto.notification.NotificationDto;
import apptemplate.application.usecases.notification.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;


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
    public ResponseEntity<PagedResponse<NotificationDto>> getNotifications(
            @Parameter(description = "Filter unread notifications only") @RequestParam(required = false, defaultValue = "false") Boolean unreadOnly,
            @Parameter(description = "Filter notifications from this date (ISO format)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "Filter notifications up to this date (ISO format)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<NotificationDto> notifications = getUserNotificationsUseCase.execute(unreadOnly, startDate, endDate, pageable);
        return ResponseEntity.ok(PagedResponse.from(notifications));
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
}
