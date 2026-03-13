package com.apptemplate.api.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> generalBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();

    private static final Set<String> AUTH_PATHS = Set.of(
            "/api/auth/login",
            "/api/auth/forgot-password"
    );

    @Value("${rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${rate-limit.general.capacity:100}")
    private int generalCapacity;

    @Value("${rate-limit.general.refill-tokens:100}")
    private int generalRefillTokens;

    @Value("${rate-limit.general.refill-duration-seconds:60}")
    private int generalRefillDuration;

    @Value("${rate-limit.auth.capacity:10}")
    private int authCapacity;

    @Value("${rate-limit.auth.refill-tokens:10}")
    private int authRefillTokens;

    @Value("${rate-limit.auth.refill-duration-seconds:60}")
    private int authRefillDuration;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        // Only apply to /api/** endpoints
        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        boolean isAuthEndpoint = AUTH_PATHS.contains(path);

        Bucket bucket = isAuthEndpoint
                ? authBuckets.computeIfAbsent(clientIp, k -> createAuthBucket())
                : generalBuckets.computeIfAbsent(clientIp, k -> createGeneralBucket());

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitForRefill));
            response.getWriter().write("{\"success\":false,\"message\":\"Too many requests. Please try again later.\"}");
        }
    }

    private Bucket createGeneralBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(generalCapacity)
                        .refillGreedy(generalRefillTokens, Duration.ofSeconds(generalRefillDuration))
                        .build())
                .build();
    }

    private Bucket createAuthBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(authCapacity)
                        .refillGreedy(authRefillTokens, Duration.ofSeconds(authRefillDuration))
                        .build())
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
