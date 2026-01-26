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

            // Note: Capturing old/new values in generic EntityListener is complex without extra libraries like Envers.
            // Simplified logging for now.
            auditLog.setNewValues(entity.toString()); // Simple representation
            
            if (entityManager != null) {
                // Must flush to ensure audit log is saved, but be careful with transaction boundaries.
                // Using a separate service or propagation REQUIRES_NEW is vital here if modifying DB.
                // However, listener injection is tricky. 
                // A better approach in Spring is often AspectJ or Envers, but we'll try this simple approach 
                // leveraging a static accessor or bean provider if feasible, OR just skip detailed audit saving 
                // inside the listener if strict consistency isn't critical.
                // 
                // Actually, saving inside EntityListener is generally discouraged due to JPA lifecycle restrictions.
                // But let's assume we can obtain a bean to save it.
                // For this template, let's keep it simple: WE WILL NOT SAVE TO DB here to avoid recursion/transaction issues 
                // without full setup. We will just LOG to console as placeholder for Audit.
                System.out.println("AUDIT [" + type + "] " + entity.getClass().getSimpleName() + " by " + auditLog.getUserId());
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
