package com.apptemplate.api.common.audit;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuditEntityListener {

    private static AuditLogRepository auditLogRepository;

    public static void setAuditLogRepository(AuditLogRepository repository) {
        AuditEntityListener.auditLogRepository = repository;
    }

    @PostPersist
    public void onPostPersist(Object entity) {
        log(entity, "create");
    }

    @PostUpdate
    public void onPostUpdate(Object entity) {
        log(entity, "update");
    }

    @PostRemove
    public void onPostRemove(Object entity) {
        log(entity, "delete");
    }

    private void log(Object entity, String action) {
        if (entity instanceof AuditLog) return;
        if (auditLogRepository == null) return;

        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setAction(action);
            auditLog.setEntityType(entity.getClass().getSimpleName());

            // Try to extract ID via reflection
            try {
                var idField = entity.getClass().getDeclaredField("id");
                idField.setAccessible(true);
                Object idValue = idField.get(entity);
                if (idValue != null) {
                    auditLog.setEntityId(idValue.toString());
                }
            } catch (NoSuchFieldException | IllegalAccessException ignored) {
            }

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                    && !"anonymousUser".equals(authentication.getPrincipal())) {
                auditLog.setUserName(authentication.getName());
                Object credentials = authentication.getCredentials();
                if (credentials instanceof Long) {
                    auditLog.setUserId((Long) credentials);
                }
            }

            auditLog.setDetails(entity.toString());
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Silently fail - audit logging should not break business operations
        }
    }
}
