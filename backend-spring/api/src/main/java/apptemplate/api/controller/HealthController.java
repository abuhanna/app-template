package apptemplate.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@Tag(name = "Health", description = "Health check endpoint")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Returns the health status of the application")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "timestamp", LocalDateTime.now().toString(),
                "application", "AppTemplate API",
                "version", "1.0.0"
        ));
    }
}
