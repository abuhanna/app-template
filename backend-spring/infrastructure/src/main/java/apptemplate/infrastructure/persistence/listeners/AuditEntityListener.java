package apptemplate.infrastructure.persistence.listeners;

import apptemplate.application.ports.services.AuditService;
import apptemplate.infrastructure.persistence.entities.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * JPA Entity Listener that captures entity changes for audit logging.
 * Excludes AuditLog, RefreshToken, and Notification entities.
 */
@Component
@Slf4j
public class AuditEntityListener {

    private static AuditService auditService;
    private static ObjectMapper objectMapper;

    // Entity types to exclude from audit logging
    private static final Set<Class<?>> EXCLUDED_ENTITIES = Set.of(
        AuditLogJpaEntity.class,
        RefreshTokenJpaEntity.class,
        NotificationJpaEntity.class
    );

    @Autowired
    public void setAuditService(@Lazy AuditService auditService) {
        AuditEntityListener.auditService = auditService;
    }

    @Autowired
    public void setObjectMapper(ObjectMapper objectMapper) {
        AuditEntityListener.objectMapper = objectMapper;
    }

    @PostPersist
    public void postPersist(Object entity) {
        if (shouldSkip(entity)) return;

        try {
            String entityName = entity.getClass().getSimpleName().replace("JpaEntity", "");
            String entityId = getEntityId(entity);
            Map<String, Object> newValues = entityToMap(entity);
            Long userId = getCurrentUserId();

            auditService.logCreate(entityName, entityId, newValues, userId);
        } catch (Exception e) {
            log.warn("Failed to audit persist for {}: {}", entity.getClass().getSimpleName(), e.getMessage());
        }
    }

    @PostUpdate
    public void postUpdate(Object entity) {
        if (shouldSkip(entity)) return;

        try {
            String entityName = entity.getClass().getSimpleName().replace("JpaEntity", "");
            String entityId = getEntityId(entity);
            Map<String, Object> newValues = entityToMap(entity);
            Long userId = getCurrentUserId();

            // Note: oldValues would require additional infrastructure to capture
            // For simplicity, we only capture new values on update
            auditService.logUpdate(entityName, entityId, null, newValues, userId);
        } catch (Exception e) {
            log.warn("Failed to audit update for {}: {}", entity.getClass().getSimpleName(), e.getMessage());
        }
    }

    @PreRemove
    public void preRemove(Object entity) {
        if (shouldSkip(entity)) return;

        try {
            String entityName = entity.getClass().getSimpleName().replace("JpaEntity", "");
            String entityId = getEntityId(entity);
            Map<String, Object> oldValues = entityToMap(entity);
            Long userId = getCurrentUserId();

            auditService.logDelete(entityName, entityId, oldValues, userId);
        } catch (Exception e) {
            log.warn("Failed to audit remove for {}: {}", entity.getClass().getSimpleName(), e.getMessage());
        }
    }

    private boolean shouldSkip(Object entity) {
        return entity == null ||
               EXCLUDED_ENTITIES.contains(entity.getClass()) ||
               auditService == null;
    }

    private String getEntityId(Object entity) {
        try {
            var idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            Object id = idField.get(entity);
            return id != null ? id.toString() : "unknown";
        } catch (Exception e) {
            return "unknown";
        }
    }

    private Map<String, Object> entityToMap(Object entity) {
        try {
            if (objectMapper != null) {
                return objectMapper.convertValue(entity, Map.class);
            }
        } catch (Exception e) {
            log.warn("Failed to convert entity to map: {}", e.getMessage());
        }

        // Fallback to basic map with entity toString
        Map<String, Object> map = new HashMap<>();
        map.put("entity", entity.toString());
        return map;
    }

    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() != null) {
                // Assuming principal has getId method or is the user ID
                Object principal = auth.getPrincipal();
                if (principal instanceof Long) {
                    return (Long) principal;
                }
                // Try to get ID from principal if it has getId method
                try {
                    var method = principal.getClass().getMethod("getId");
                    Object id = method.invoke(principal);
                    if (id instanceof Long) {
                        return (Long) id;
                    } else if (id != null) {
                        return Long.parseLong(id.toString());
                    }
                } catch (Exception ignored) {
                }
            }
        } catch (Exception e) {
            log.debug("Could not get current user ID: {}", e.getMessage());
        }
        return null;
    }
}
