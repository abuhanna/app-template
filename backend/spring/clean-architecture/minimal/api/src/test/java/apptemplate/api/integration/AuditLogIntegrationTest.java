package apptemplate.api.integration;

import apptemplate.domain.enums.NotificationType;
import apptemplate.domain.enums.UserRole;
import apptemplate.infrastructure.persistence.jpa.AuditLogJpaRepository;
import apptemplate.infrastructure.persistence.jpa.NotificationJpaRepository;
import apptemplate.infrastructure.persistence.jpa.UserJpaRepository;
import apptemplate.infrastructure.persistence.entities.NotificationJpaEntity;
import apptemplate.infrastructure.persistence.entities.AuditLogJpaEntity;
import apptemplate.infrastructure.persistence.entities.UserJpaEntity;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class AuditLogIntegrationTest {

    @Autowired
    private UserJpaRepository userRepository;

    @Autowired
    private NotificationJpaRepository notificationRepository;

    @Autowired
    private AuditLogJpaRepository auditLogRepository;

    @Test
    public void testAuditLogCreatedOnInsert() {
        // Create a test user first (needed for FK constraint)
        UserJpaEntity user = UserJpaEntity.builder()
            .username("audittest")
            .email("audittest@test.com")
            .passwordHash("$2a$10$dummyhash")
            .role(UserRole.USER)
            .isActive(true)
            .build();
        user = userRepository.save(user);

        // Setup mock user
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(user.getId(), "password")
        );

        // Verify audit log was created for user insert
        List<AuditLogJpaEntity> logs = auditLogRepository.findAll();
        System.out.println("Logs count: " + logs.size());
        logs.forEach(l -> System.out.println("Log: " + l.getAction() + " on " + l.getEntityName()));

        Assertions.assertFalse(logs.isEmpty(), "Audit log should not be empty");

        AuditLogJpaEntity userLog = logs.stream()
            .filter(l -> "User".equals(l.getEntityName()))
            .findFirst()
            .orElse(null);
        Assertions.assertNotNull(userLog, "Should have audit log for User entity");
        Assertions.assertEquals("CREATED", userLog.getAction());
    }
}
