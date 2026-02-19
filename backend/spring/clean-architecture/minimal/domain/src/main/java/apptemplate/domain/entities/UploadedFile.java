package apptemplate.domain.entities;

import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * UploadedFile entity with business logic.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class UploadedFile extends AuditableEntity {

    private String fileName;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private String storagePath;
    private String description;
    private String category;
    private boolean isPublic;



    /**
     * Updates file metadata.
     */
    public void update(String description, String category, Boolean isPublic) {
        if (description != null) this.description = description;
        if (category != null) this.category = category;
        if (isPublic != null) this.isPublic = isPublic;
    }
}
