package apptemplate.domain.exceptions;

import java.util.ArrayList;
import java.util.List;

/**
 * Exception thrown when validation fails.
 */
public class ValidationException extends BusinessException {

    private final List<String> errors;

    public ValidationException(String message) {
        super(message);
        this.errors = new ArrayList<>();
    }

    public ValidationException(String message, List<String> errors) {
        super(message);
        this.errors = errors != null ? errors : new ArrayList<>();
    }

    public ValidationException(String field, String errorMessage) {
        super(String.format("Validation failed for field '%s': %s", field, errorMessage));
        this.errors = new ArrayList<>();
        this.errors.add(field + ": " + errorMessage);
    }

    public List<String> getErrors() {
        return errors;
    }
}
