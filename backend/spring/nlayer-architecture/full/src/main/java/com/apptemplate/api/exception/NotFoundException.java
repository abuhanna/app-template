package com.apptemplate.api.exception;

public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }

    public NotFoundException(String entityName, Long id) {
        super(entityName + " not found with id: " + id);
    }

    public NotFoundException(String entityName, String field, String value) {
        super(entityName + " not found with " + field + ": " + value);
    }
}
