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
     * Name of the entity that was modified (e.g., "User", "Department")
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
     * User ID of who performed the action
     */
    private Long userId;

    /**
     * UTC timestamp when the action occurred
     */
    private LocalDateTime timestamp;

    public enum AuditAction {
        CREATED,
        UPDATED,
        DELETED
    }
}
