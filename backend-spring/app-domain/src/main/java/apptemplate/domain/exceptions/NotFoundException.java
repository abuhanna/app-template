package apptemplate.domain.exceptions;

/**
 * Exception thrown when a requested resource is not found.
 */
public class NotFoundException extends BusinessException {

    public NotFoundException(String message) {
        super(message);
    }

    public NotFoundException(String entityName, Object id) {
        super(String.format("%s with id '%s' was not found", entityName, id));
    }
}
