package com.apptemplate.api.features.notifications;

import com.apptemplate.api.common.dto.ApiResponse;
import com.apptemplate.api.common.dto.PagedResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get my notifications", description = "Get paginated list of notifications for authenticated user")
    public ResponseEntity<ApiResponse<PagedResult<NotificationDto>>> getNotifications(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Search") @RequestParam(required = false) String search,
            @Parameter(description = "Column to sort by") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort order: asc or desc") @RequestParam(defaultValue = "desc") String sortOrder,
            @Parameter(description = "Filter unread notifications only") @RequestParam(required = false, defaultValue = "false") Boolean unreadOnly
    ) {
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        Page<NotificationDto> notifications = notificationService.getNotifications(unreadOnly, page, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(ApiResponse.success(PagedResult.fromPage(notifications), "Notifications retrieved successfully"));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread count", description = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all as read")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
