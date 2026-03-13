package apptemplate.application.ports.services;

/**
 * Port interface for JWT token operations.
 * In minimal variant, tokens come from an external SSO provider and are only validated, not generated.
 */
public interface JwtTokenService {

    /**
     * Validates a JWT token.
     */
    boolean validateToken(String token);

    /**
     * Gets the user ID from a token (subject claim, String).
     */
    String getUserIdFromToken(String token);

    /**
     * Gets the username from a token.
     */
    String getUsernameFromToken(String token);

    /**
     * Gets the email from a token.
     */
    String getEmailFromToken(String token);

    /**
     * Gets the role from a token.
     */
    String getRoleFromToken(String token);

    /**
     * Gets the token expiration time in seconds.
     */
    long getExpirationSeconds();
}
