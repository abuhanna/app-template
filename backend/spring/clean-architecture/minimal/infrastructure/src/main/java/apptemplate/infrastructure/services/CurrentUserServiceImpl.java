package apptemplate.infrastructure.services;

import apptemplate.application.ports.services.CurrentUserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;


@Service
public class CurrentUserServiceImpl implements CurrentUserService {

    @Override
    public Optional<String> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        // In minimal variant, the principal or credentials hold a string user ID from JWT claims
        Object credentials = authentication.getCredentials();
        if (credentials instanceof String && !"".equals(credentials)) {
            return Optional.of((String) credentials);
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof String && !"anonymousUser".equals(principal)) {
            return Optional.of((String) principal);
        }

        // Fallback: use the authentication name (typically the email/subject from JWT)
        String name = authentication.getName();
        if (name != null && !"anonymousUser".equals(name)) {
            return Optional.of(name);
        }

        return Optional.empty();
    }

    @Override
    public Optional<String> getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        String name = authentication.getName();
        if ("anonymousUser".equals(name)) {
            return Optional.empty();
        }

        return Optional.of(name);
    }

    @Override
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName());
    }

    @Override
    public String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .orElse(null);
    }

    @Override
    public String getClientIpAddress() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return "unknown";
        }

        HttpServletRequest request = attributes.getRequest();

        // Check for forwarded IP (proxy/load balancer)
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, take the first one
            return forwardedFor.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isEmpty()) {
            return realIp;
        }

        return request.getRemoteAddr();
    }
}
