package com.apptemplate.api.audit;

import com.apptemplate.api.model.AuditLog;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AuditEntityListener {

    private static EntityManager entityManager;

    @Autowired
    @Lazy
    public void setEntityManager(EntityManager entityManager) {
        AuditEntityListener.entityManager = entityManager;
    }

    @PostPersist
    public void onPostPersist(Object entity) {
        log(entity, "INSERT");
    }

    @PostUpdate
    public void onPostUpdate(Object entity) {
        log(entity, "UPDATE");
    }

    @PostRemove
    public void onPostRemove(Object entity) {
        log(entity, "DELETE");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void log(Object entity, String action) {
        if (entity instanceof AuditLog) return;

        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setEntityType(entity.getClass().getSimpleName());
            auditLog.setAction(action.toLowerCase());

            // Try to extract entity ID via reflection
            try {
                var idField = entity.getClass().getDeclaredField("id");
                idField.setAccessible(true);
                Object idValue = idField.get(entity);
                if (idValue != null) {
                    auditLog.setEntityId(idValue.toString());
                }
            } catch (NoSuchFieldException ignored) {}

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                auditLog.setUserName(authentication.getName());
            }

            auditLog.setDetails(entity.toString());

            if (entityManager != null) {
                System.out.println("AUDIT [" + action + "] " + entity.getClass().getSimpleName() + " by " + auditLog.getUserName());
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
