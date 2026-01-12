package apptemplate.domain.entities;

import apptemplate.domain.enums.UserRole;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User entity with business logic.
 */
@Getter
@Setter
@NoArgsConstructor
public class User extends AuditableEntity {

    private String username;
    private String email;
    private String passwordHash;
    private String name;
    private UserRole role;
    private Long departmentId;
    private boolean active;
    private LocalDateTime lastLoginAt;

    // Password reset fields
    private String passwordResetToken;
    private LocalDateTime passwordResetTokenExpiry;

    /**
     * Creates a new user.
     */
    public User(String username, String email, String passwordHash, String name, UserRole role, Long departmentId) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
        this.role = role;
        this.departmentId = departmentId;
        this.active = true;
    }

    /**
     * Updates user information.
     */
    public void update(String name, String email, UserRole role, Long departmentId) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.departmentId = departmentId;
    }

    /**
     * Updates user password.
     */
    public void updatePassword(String passwordHash) {
        this.passwordHash = passwordHash;
        clearPasswordResetToken();
    }

    /**
     * Sets user active status.
     */
    public void setActiveStatus(boolean active) {
        this.active = active;
    }

    /**
     * Records user login.
     */
    public void recordLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }

    /**
     * Sets password reset token with expiry.
     */
    public void setPasswordResetToken(String token, LocalDateTime expiry) {
        this.passwordResetToken = token;
        this.passwordResetTokenExpiry = expiry;
    }

    /**
     * Generates a password reset token valid for specified hours.
     */
    public String generatePasswordResetToken(int validHours) {
        String token = UUID.randomUUID().toString();
        this.passwordResetToken = token;
        this.passwordResetTokenExpiry = LocalDateTime.now().plusHours(validHours);
        return token;
    }

    /**
     * Clears password reset token.
     */
    public void clearPasswordResetToken() {
        this.passwordResetToken = null;
        this.passwordResetTokenExpiry = null;
    }

    /**
     * Validates password reset token.
     */
    public boolean isPasswordResetTokenValid(String token) {
        if (this.passwordResetToken == null || this.passwordResetTokenExpiry == null) {
            return false;
        }
        return this.passwordResetToken.equals(token) &&
               LocalDateTime.now().isBefore(this.passwordResetTokenExpiry);
    }

    /**
     * Checks if user is admin.
     */
    public boolean isAdmin() {
        return this.role == UserRole.ADMIN;
    }
}
