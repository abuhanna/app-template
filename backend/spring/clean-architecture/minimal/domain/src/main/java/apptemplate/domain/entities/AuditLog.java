package apptemplate.domain.entities;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Represents an audit log entry that tracks changes to entities.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    private Long id;

    /**
     * Name of the entity that was modified (e.g., "UploadedFile", "Notification")
     */
    private String entityName;

    /**
     * Primary key of the entity that was modified
     */
    private String entityId;

    /**
     * The type of action performed: CREATED, UPDATED, DELETED
     */
    private AuditAction action;

    /**
     * JSON representation of the entity's values before the change (null for Created)
     */
    private String oldValues;

    /**
     * JSON representation of the entity's values after the change (null for Deleted)
     */
    private String newValues;

    /**
     * List of property names that were modified (JSON array)
     */
    private String affectedColumns;

    /**
     * User ID of who performed the action (from JWT claims)
     */
    private String userId;

    /**
     * Display name of the user who performed the action
     */
    private String userName;

    /**
     * Additional details about the action
     */
    private String details;

    /**
     * IP address of the client that performed the action
     */
    private String ipAddress;

    /**
     * UTC timestamp when the action occurred
     */
    private LocalDateTime createdAt;

    public enum AuditAction {
        CREATED,
        UPDATED,
        DELETED
    }
}
