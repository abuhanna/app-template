package com.apptemplate.api.common.audit;

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

    @Column(name = "user_id")
    private String userId;

    private String type; // INSERT, UPDATE, DELETE
    
    @Column(name = "table_name")
    private String tableName;

    @CreationTimestamp
    @Column(name = "date_time")
    private LocalDateTime dateTime;

    @Column(columnDefinition = "TEXT", name = "old_values")
    private String oldValues;

    @Column(columnDefinition = "TEXT", name = "new_values")
    private String newValues;
}
