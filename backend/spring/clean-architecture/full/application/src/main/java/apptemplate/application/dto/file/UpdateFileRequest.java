package apptemplate.application.dto.file;

import lombok.Data;

@Data
public class UpdateFileRequest {
    private String description;
    private String category;
    private Boolean isPublic;
}
