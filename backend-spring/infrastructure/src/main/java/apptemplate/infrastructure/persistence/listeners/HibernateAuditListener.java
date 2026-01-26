package apptemplate.infrastructure.persistence.listeners;

import apptemplate.application.ports.services.AuditService;
import apptemplate.infrastructure.persistence.entities.AuditLogJpaEntity;
import apptemplate.infrastructure.persistence.entities.NotificationJpaEntity;
import apptemplate.infrastructure.persistence.entities.RefreshTokenJpaEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.event.spi.*;
import org.hibernate.persister.entity.EntityPersister;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
@Slf4j
@RequiredArgsConstructor
public class HibernateAuditListener implements PostInsertEventListener, PostUpdateEventListener, PostDeleteEventListener {

    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    // Entity types to exclude from audit logging
    private static final Set<Class<?>> EXCLUDED_ENTITIES = Set.of(
        AuditLogJpaEntity.class,
        RefreshTokenJpaEntity.class,
        NotificationJpaEntity.class
    );

    @Override
    public void onPostInsert(PostInsertEvent event) {
        if (shouldSkip(event.getEntity())) return;

        try {
            String entityName = getEntityName(event.getEntity());
            String entityId = event.getId().toString();
            Map<String, Object> newValues = getStateMap(event.getState(), event.getPersister().getPropertyNames());
            Long userId = getCurrentUserId();

            auditService.logCreate(entityName, entityId, newValues, userId);
        } catch (Exception e) {
            log.warn("Failed to audit insert for {}: {}", event.getEntity().getClass().getSimpleName(), e.getMessage());
        }
    }

    @Override
    public void onPostUpdate(PostUpdateEvent event) {
        if (shouldSkip(event.getEntity())) return;

        try {
            String entityName = getEntityName(event.getEntity());
            String entityId = event.getId().toString();
            Long userId = getCurrentUserId();

            Map<String, Object> oldValues = new HashMap<>();
            Map<String, Object> newValues = new HashMap<>();
            
            String[] propertyNames = event.getPersister().getPropertyNames();
            Object[] oldState = event.getOldState();
            Object[] newState = event.getState();
            int[] dirtyProperties = event.getDirtyProperties();

            // Only capture changed properties
            for (int i : dirtyProperties) {
                String propertyName = propertyNames[i];
                oldValues.put(propertyName, oldState[i]);
                newValues.put(propertyName, newState[i]);
            }
            
            // If nothing changed (which shouldn't happen in PostUpdate but good to check), skip
            if (oldValues.isEmpty() && newValues.isEmpty()) return;

            auditService.logUpdate(entityName, entityId, oldValues, newValues, userId);
        } catch (Exception e) {
            log.warn("Failed to audit update for {}: {}", event.getEntity().getClass().getSimpleName(), e.getMessage());
        }
    }

    @Override
    public void onPostDelete(PostDeleteEvent event) {
        if (shouldSkip(event.getEntity())) return;

        try {
            String entityName = getEntityName(event.getEntity());
            String entityId = event.getId().toString();
            Map<String, Object> oldValues = getStateMap(event.getDeletedState(), event.getPersister().getPropertyNames());
            Long userId = getCurrentUserId();

            auditService.logDelete(entityName, entityId, oldValues, userId);
        } catch (Exception e) {
            log.warn("Failed to audit delete for {}: {}", event.getEntity().getClass().getSimpleName(), e.getMessage());
        }
    }

    @Override
    public boolean requiresPostCommitHandling(EntityPersister persister) {
        return false; // We can log immediately, or return true if we want to log only after transaction commit
    }

    // Helper methods

    private boolean shouldSkip(Object entity) {
        return entity == null || EXCLUDED_ENTITIES.contains(entity.getClass());
    }

    private String getEntityName(Object entity) {
        return entity.getClass().getSimpleName().replace("JpaEntity", "");
    }

    private Map<String, Object> getStateMap(Object[] state, String[] propertyNames) {
        Map<String, Object> map = new HashMap<>();
        if (state == null || propertyNames == null) return map;
        
        for (int i = 0; i < propertyNames.length; i++) {
            if (i < state.length) {
                map.put(propertyNames[i], state[i]);
            }
        }
        return map;
    }

    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() != null) {
                Object principal = auth.getPrincipal();
                if (principal instanceof Long) {
                    return (Long) principal;
                }
                // Try to get ID via reflection if needed, similar to previous listener
                try {
                    var method = principal.getClass().getMethod("getId");
                    Object id = method.invoke(principal);
                    if (id instanceof Long) {
                        return (Long) id;
                    } else if (id != null) {
                        return Long.parseLong(id.toString());
                    }
                } catch (Exception e) {
                    // ignore
                }
            }
        } catch (Exception e) {
            log.debug("Could not get current user ID: {}", e.getMessage());
        }
        return null;
    }
}
