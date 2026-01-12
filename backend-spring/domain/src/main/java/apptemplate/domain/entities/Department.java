package apptemplate.domain.entities;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Department entity with business logic.
 */
@Getter
@Setter
@NoArgsConstructor
public class Department extends AuditableEntity {

    private String code;
    private String name;
    private String description;
    private boolean active;

    /**
     * Creates a new department.
     */
    public Department(String code, String name, String description) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.active = true;
    }

    /**
     * Updates department information.
     */
    public void update(String name, String description) {
        this.name = name;
        this.description = description;
    }

    /**
     * Updates department code.
     */
    public void updateCode(String code) {
        this.code = code;
    }

    /**
     * Sets department active status.
     */
    public void setActiveStatus(boolean active) {
        this.active = active;
    }
}
