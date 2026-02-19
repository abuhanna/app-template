package apptemplate.application.dto.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Long id;
    private String entityName;
    private String entityId;
    private String action;
    private String oldValues;
    private String newValues;
    private String affectedColumns;
    private Long userId;
    private LocalDateTime timestamp;
}
