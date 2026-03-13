package com.apptemplate.api.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

/**
 * JWT utilities for minimal variant (external auth).
 * Tokens are validated but not generated -- they come from the external SSO provider.
 */
@Component
public class JwtUtils {

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String secretKey;

    @Value("${jwt.expiration:900}")
    private long jwtExpirationSeconds;

    @Value("${jwt.refresh-expiration-days:7}")
    private int refreshExpirationDays;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUserId(String token) {
        // In minimal variant, userId is a String from JWT claims
        String userId = extractClaim(token, claims -> claims.get("userId", String.class));
        if (userId == null) {
            // Fallback: try as Long (backward compatibility)
            Long userIdLong = extractClaim(token, claims -> claims.get("userId", Long.class));
            if (userIdLong != null) {
                return userIdLong.toString();
            }
            // Last fallback: use subject
            return extractClaim(token, Claims::getSubject);
        }
        return userId;
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public long getExpirationSeconds() {
        return jwtExpirationSeconds;
    }

    public int getRefreshExpirationDays() {
        return refreshExpirationDays;
    }

    public boolean isTokenValid(String token, String email) {
        final String username = extractUsername(token);
        return (username.equals(email)) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
