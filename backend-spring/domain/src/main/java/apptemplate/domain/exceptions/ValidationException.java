package apptemplate.domain.exceptions;

import java.util.HashMap;
import java.util.Map;

/**
 * Exception thrown when validation fails.
 */
public class ValidationException extends BusinessException {

    private final Map<String, String> errors;

    public ValidationException(String message) {
        super(message);
        this.errors = new HashMap<>();
    }

    public ValidationException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors != null ? errors : new HashMap<>();
    }

    public ValidationException(String field, String errorMessage) {
        super(String.format("Validation failed for field '%s': %s", field, errorMessage));
        this.errors = new HashMap<>();
        this.errors.put(field, errorMessage);
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
