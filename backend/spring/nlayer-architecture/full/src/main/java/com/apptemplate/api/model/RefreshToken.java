package com.apptemplate.api.model;

import jakarta.persistence.*;
import lombok.Data;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Data
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "replaced_by_token")
    private String replacedByToken;

    @Column(name = "created_by_ip", length = 45)
    private String createdByIp;

    @Column(name = "revoked_by_ip", length = 45)
    private String revokedByIp;

    @Column(name = "is_revoked")
    private boolean isRevoked = false;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base64.Encoder BASE64_ENCODER = Base64.getUrlEncoder().withoutPadding();

    /**
     * Creates a new refresh token for a user.
     */
    public static RefreshToken create(Long userId, int expirationDays) {
        RefreshToken rt = new RefreshToken();
        rt.setToken(generateSecureToken());
        rt.setUserId(userId);
        rt.setCreatedAt(LocalDateTime.now());
        rt.setExpiresAt(rt.getCreatedAt().plusDays(expirationDays));
        return rt;
    }

    private static String generateSecureToken() {
        byte[] randomBytes = new byte[64];
        SECURE_RANDOM.nextBytes(randomBytes);
        return BASE64_ENCODER.encodeToString(randomBytes);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public boolean isActive() {
        return !isRevoked && !isExpired() && this.revokedAt == null;
    }

    public void revoke(String replacedByToken) {
        this.revokedAt = LocalDateTime.now();
        this.replacedByToken = replacedByToken;
        this.isRevoked = true;
    }

    public void revoke() {
        revoke(null);
    }
}
