package apptemplate.application.ports.services;

import apptemplate.domain.entities.User;



/**
 * Port interface for JWT token operations.
 */
public interface JwtTokenService {

    /**
     * Generates a JWT access token for the user.
     */
    String generateToken(User user);

    /**
     * Validates a JWT token.
     */
    boolean validateToken(String token);

    /**
     * Gets the user ID from a token.
     */
    Long getUserIdFromToken(String token);

    /**
     * Gets the username from a token.
     */
    String getUsernameFromToken(String token);

    /**
     * Gets the role from a token.
     */
    String getRoleFromToken(String token);

    /**
     * Gets the token expiration time in seconds.
     */
    long getExpirationSeconds();
}
