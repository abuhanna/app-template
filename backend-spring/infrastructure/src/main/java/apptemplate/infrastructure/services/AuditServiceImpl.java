package apptemplate.infrastructure.services;

import apptemplate.application.ports.repositories.AuditLogRepository;
import apptemplate.application.ports.services.AuditService;
import apptemplate.domain.entities.AuditLog;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logCreate(String entityName, String entityId, Object newValues, Long userId) {
        try {
            AuditLog auditLog = AuditLog.builder()
                .entityName(entityName)
                .entityId(entityId)
                .action(AuditLog.AuditAction.CREATED)
                .newValues(toJson(newValues))
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to log create audit for {} {}: {}", entityName, entityId, e.getMessage());
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logUpdate(String entityName, String entityId, Object oldValues, Object newValues, Long userId) {
        try {
            AuditLog auditLog = AuditLog.builder()
                .entityName(entityName)
                .entityId(entityId)
                .action(AuditLog.AuditAction.UPDATED)
                .oldValues(toJson(oldValues))
                .newValues(toJson(newValues))
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to log update audit for {} {}: {}", entityName, entityId, e.getMessage());
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logDelete(String entityName, String entityId, Object oldValues, Long userId) {
        try {
            AuditLog auditLog = AuditLog.builder()
                .entityName(entityName)
                .entityId(entityId)
                .action(AuditLog.AuditAction.DELETED)
                .oldValues(toJson(oldValues))
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to log delete audit for {} {}: {}", entityName, entityId, e.getMessage());
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditLog save(AuditLog auditLog) {
        return auditLogRepository.save(auditLog);
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize object to JSON: {}", e.getMessage());
            return obj.toString();
        }
    }
}
