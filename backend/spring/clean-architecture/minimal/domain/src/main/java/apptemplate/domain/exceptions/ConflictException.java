package apptemplate.domain.exceptions;

/**
 * Exception thrown when there is a conflict with existing data.
 */
public class ConflictException extends BusinessException {

    public ConflictException(String message) {
        super(message);
    }

    public ConflictException(String field, String value) {
        super(String.format("A record with %s '%s' already exists", field, value));
    }
}
