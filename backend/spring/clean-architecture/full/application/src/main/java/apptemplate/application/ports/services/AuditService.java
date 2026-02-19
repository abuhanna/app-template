package apptemplate.application.ports.services;

import apptemplate.domain.entities.AuditLog;

/**
 * Port interface for audit logging operations.
 */
public interface AuditService {

    /**
     * Log a create operation.
     */
    void logCreate(String entityName, String entityId, Object newValues, Long userId);

    /**
     * Log an update operation.
     */
    void logUpdate(String entityName, String entityId, Object oldValues, Object newValues, Long userId);

    /**
     * Log a delete operation.
     */
    void logDelete(String entityName, String entityId, Object oldValues, Long userId);

    /**
     * Save an audit log entry.
     */
    AuditLog save(AuditLog auditLog);
}
