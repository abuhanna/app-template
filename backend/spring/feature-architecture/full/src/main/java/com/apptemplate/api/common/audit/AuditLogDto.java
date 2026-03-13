package com.apptemplate.api.common.audit;

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
    private String entityName;
    private String entityId;
    private String action;
    private String oldValues;
    private String newValues;
    private String affectedColumns;
    private String userId;
    private String userName;
    private String details;
    private String ipAddress;
    private LocalDateTime createdAt;

    public static AuditLogDto fromEntity(AuditLog auditLog) {
        return AuditLogDto.builder()
                .id(auditLog.getId())
                .entityName(auditLog.getEntityName())
                .entityId(auditLog.getEntityId())
                .action(auditLog.getAction())
                .oldValues(auditLog.getOldValues())
                .newValues(auditLog.getNewValues())
                .affectedColumns(auditLog.getAffectedColumns())
                .userId(auditLog.getUserId())
                .userName(auditLog.getUserName())
                .details(auditLog.getDetails())
                .ipAddress(auditLog.getIpAddress())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}
