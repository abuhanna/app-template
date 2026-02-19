package com.apptemplate.api.features.notifications;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    private String title;
    private String message;
    private String type;

    @Column(name = "is_read")
    private boolean isRead = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
