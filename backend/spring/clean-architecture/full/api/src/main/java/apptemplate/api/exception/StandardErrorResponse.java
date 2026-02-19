package apptemplate.api.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StandardErrorResponse {
    private int statusCode;
    private String message;
    private String error;
    private String timestamp;
    private String path;
    private Map<String, String> details;
}
