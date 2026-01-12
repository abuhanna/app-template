package apptemplate.application.ports.services;

/**
 * Port interface for accessing current user information.
 */
public interface CurrentUserService {

    /**
     * Gets the current user's ID from the security context.
     */
    Long getCurrentUserId();

    /**
     * Gets the current user's username from the security context.
     */
    String getCurrentUsername();

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
