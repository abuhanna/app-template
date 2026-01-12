package apptemplate.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

/**
 * Refresh token entity for JWT token rotation.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    private Long id;
    private String token;
    private Long userId;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime revokedAt;
    private String replacedByToken;
    private String createdByIp;
    private String revokedByIp;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base64.Encoder BASE64_ENCODER = Base64.getUrlEncoder().withoutPadding();

    /**
     * Creates a new refresh token.
     */
    public RefreshToken(Long userId, int expirationDays, String createdByIp) {
        this.token = generateSecureToken();
        this.userId = userId;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = this.createdAt.plusDays(expirationDays);
        this.createdByIp = createdByIp;
    }

    /**
     * Creates a new refresh token with specified expiration.
     */
    public RefreshToken(Long userId, LocalDateTime expiresAt, String createdByIp) {
        this.token = generateSecureToken();
        this.userId = userId;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = expiresAt;
        this.createdByIp = createdByIp;
    }

    /**
     * Generates a cryptographically secure random token.
     */
    private String generateSecureToken() {
        byte[] randomBytes = new byte[64];
        SECURE_RANDOM.nextBytes(randomBytes);
        return BASE64_ENCODER.encodeToString(randomBytes);
    }

    /**
     * Checks if the token is expired.
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    /**
     * Checks if the token is revoked.
     */
    public boolean isRevoked() {
        return this.revokedAt != null;
    }

    /**
     * Checks if the token is active (not expired and not revoked).
     */
    public boolean isActive() {
        return !isRevoked() && !isExpired();
    }

    /**
     * Revokes the token.
     */
    public void revoke(String revokedByIp, String replacedByToken) {
        this.revokedAt = LocalDateTime.now();
        this.revokedByIp = revokedByIp;
        this.replacedByToken = replacedByToken;
    }

    /**
     * Revokes the token without replacement.
     */
    public void revoke(String revokedByIp) {
        revoke(revokedByIp, null);
    }
}
