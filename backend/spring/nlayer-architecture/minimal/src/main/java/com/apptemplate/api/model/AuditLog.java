package com.apptemplate.api.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String action; // create, update, delete, login, logout

    @Column(name = "entity_name", nullable = false, length = 100)
    private String entityName; // UploadedFile, Notification

    @Column(name = "entity_id", nullable = false, length = 50)
    private String entityId;

    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;

    @Column(name = "affected_columns", columnDefinition = "TEXT")
    private String affectedColumns;

    @Column(name = "user_id", length = 100)
    private String userId;

    @Column(name = "user_name", length = 200)
    private String userName;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
