package apptemplate.application.ports.services;

import java.util.Optional;

/**
 * Port interface for accessing current user information.
 * In minimal variant, user ID is a String from JWT claims (no users table).
 */
public interface CurrentUserService {

    /**
     * Gets the current user's ID from the security context (String from JWT claims).
     */
    Optional<String> getCurrentUserId();

    /**
     * Gets the current user's username from the security context.
     */
    Optional<String> getCurrentUsername();

    /**
     * Gets the current user's role from the security context.
     */
    String getCurrentUserRole();

    /**
     * Checks if the current user is authenticated.
     */
    boolean isAuthenticated();

    /**
     * Gets the client IP address.
     */
    String getClientIpAddress();
}
