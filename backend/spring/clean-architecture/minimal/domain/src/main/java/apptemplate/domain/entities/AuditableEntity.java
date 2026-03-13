package apptemplate.domain.entities;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Base entity with audit fields.
 * In minimal variant, createdBy/updatedBy are String (from JWT claims, no users table).
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class AuditableEntity {

    private Long id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    /**
     * Sets audit fields for creation.
     * Called by infrastructure layer on insert.
     */
    public void setCreatedAudit(String userId) {
        this.createdAt = LocalDateTime.now();
        this.createdBy = userId;
        this.updatedAt = this.createdAt;
        this.updatedBy = userId;
    }

    /**
     * Sets audit fields for update.
     * Called by infrastructure layer on update.
     */
    public void setUpdatedAudit(String userId) {
        this.updatedAt = LocalDateTime.now();
        this.updatedBy = userId;
    }
}
