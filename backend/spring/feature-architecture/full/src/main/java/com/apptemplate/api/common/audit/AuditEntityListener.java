package com.apptemplate.api.common.audit;

import jakarta.persistence.EntityManager;
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

    private void log(Object entity, String type) {
        if (entity instanceof AuditLog) return;
        
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setTableName(entity.getClass().getSimpleName());
            auditLog.setType(type);
            
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                auditLog.setUserId(authentication.getName());
            }

            auditLog.setNewValues(entity.toString());
            
            if (entityManager != null) {
                // Simplified: just logging to console
                System.out.println("AUDIT [" + type + "] " + entity.getClass().getSimpleName() + " by " + auditLog.getUserId());
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
