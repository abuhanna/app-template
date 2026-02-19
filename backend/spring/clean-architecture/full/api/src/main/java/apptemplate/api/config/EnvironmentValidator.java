package apptemplate.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Validates required environment variables and configuration on application startup.
 * Implements ApplicationRunner to run after the application context is loaded but before serving requests.
 */
@Component
public class EnvironmentValidator implements ApplicationRunner {

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${jwt.issuer:}")
    private String jwtIssuer;

    @Value("${jwt.audience:}")
    private String jwtAudience;

    @Override
    public void run(ApplicationArguments args) {
        List<String> errors = new ArrayList<>();

        // Required database configuration
        if (datasourceUrl == null || datasourceUrl.isBlank()) {
            errors.add("Missing required configuration: spring.datasource.url");
        }

        // Required JWT configuration
        if (jwtSecret == null || jwtSecret.isBlank()) {
            errors.add("Missing required configuration: jwt.secret");
        } else if (jwtSecret.length() < 32) {
            errors.add("jwt.secret must be at least 32 characters long");
        }

        if (jwtIssuer == null || jwtIssuer.isBlank()) {
            errors.add("Missing required configuration: jwt.issuer");
        }

        if (jwtAudience == null || jwtAudience.isBlank()) {
            errors.add("Missing required configuration: jwt.audience");
        }

        // Throw if any validation errors
        if (!errors.isEmpty()) {
            String errorMessage = String.join("\n  - ", errors);
            throw new IllegalStateException(
                    "Environment validation failed:\n  - " + errorMessage +
                    "\n\nPlease check your application.properties or environment variables.");
        }
    }
}
