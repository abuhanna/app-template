package com.apptemplate.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {

    private Long id;
    private String action;
    private String entityName;
    private String entityId;
    private String userId;
    private String userName;
    private String oldValues;
    private String newValues;
    private String affectedColumns;
    private String details;
    private String ipAddress;
    private LocalDateTime createdAt;
}
