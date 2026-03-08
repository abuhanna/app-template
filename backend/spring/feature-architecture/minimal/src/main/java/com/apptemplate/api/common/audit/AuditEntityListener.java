package com.apptemplate.api.common.audit;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuditEntityListener {

    private static AuditLogRepository auditLogRepository;

    @Autowired
    @Lazy
    public void setAuditLogRepository(AuditLogRepository auditLogRepository) {
        AuditEntityListener.auditLogRepository = auditLogRepository;
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

        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setEntityType(entity.getClass().getSimpleName());
            auditLog.setAction(action);

            // Extract entity ID via reflection
            try {
                var idField = entity.getClass().getDeclaredField("id");
                idField.setAccessible(true);
                Object idValue = idField.get(entity);
                if (idValue != null) {
                    auditLog.setEntityId(idValue.toString());
                }
            } catch (NoSuchFieldException | IllegalAccessException ignored) {}

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                    && !"anonymousUser".equals(authentication.getName())) {
                auditLog.setUserName(authentication.getName());
            }

            auditLog.setDetails(action + " " + entity.getClass().getSimpleName());

            if (auditLogRepository != null) {
                auditLogRepository.save(auditLog);
            }
        } catch (Exception e) {
            // Don't let audit logging failures break the main operation
            System.err.println("Audit logging failed: " + e.getMessage());
        }
    }
}
