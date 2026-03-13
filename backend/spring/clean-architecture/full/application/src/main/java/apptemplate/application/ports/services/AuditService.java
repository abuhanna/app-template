package apptemplate.application.ports.services;

import apptemplate.domain.entities.AuditLog;

/**
 * Port interface for audit logging operations.
 */
public interface AuditService {

    /**
     * Log a create operation.
     */
    void logCreate(String entityName, String entityId, Object newValues, String userId);

    /**
     * Log an update operation.
     */
    void logUpdate(String entityName, String entityId, Object oldValues, Object newValues, String userId);

    /**
     * Log a delete operation.
     */
    void logDelete(String entityName, String entityId, Object oldValues, String userId);

    /**
     * Save an audit log entry.
     */
    AuditLog save(AuditLog auditLog);
}
