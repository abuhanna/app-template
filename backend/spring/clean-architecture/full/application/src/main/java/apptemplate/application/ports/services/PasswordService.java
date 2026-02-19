package apptemplate.application.ports.services;

/**
 * Port interface for password hashing operations.
 */
public interface PasswordService {

    /**
     * Hashes a plain text password using BCrypt.
     */
    String hashPassword(String plainPassword);

    /**
     * Verifies a plain text password against a hashed password.
     */
    boolean verifyPassword(String plainPassword, String hashedPassword);
}
