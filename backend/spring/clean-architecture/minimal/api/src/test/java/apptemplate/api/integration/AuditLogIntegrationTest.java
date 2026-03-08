package apptemplate.api.integration;

import apptemplate.domain.enums.NotificationType;
import apptemplate.infrastructure.persistence.jpa.AuditLogJpaRepository;
import apptemplate.infrastructure.persistence.jpa.NotificationJpaRepository;
import apptemplate.infrastructure.persistence.entities.NotificationJpaEntity;
import apptemplate.infrastructure.persistence.entities.AuditLogJpaEntity;
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
    private NotificationJpaRepository notificationRepository;

    @Autowired
    private AuditLogJpaRepository auditLogRepository;

    @Test
    public void testAuditLogCreatedOnInsert() {
        // Setup mock user
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(1L, "password")
        );

        // Create entity
        NotificationJpaEntity notification = NotificationJpaEntity.builder()
            .userId(1L)
            .title("Test Notification")
            .message("Test message for audit log")
            .type(NotificationType.INFO)
            .isRead(false)
            .build();

        // Save entity (should trigger CREATE audit)
        notificationRepository.save(notification);

        // Verify audit log
        List<AuditLogJpaEntity> logs = auditLogRepository.findAll();
        System.out.println("Logs count: " + logs.size());
        logs.forEach(l -> System.out.println("Log: " + l.getAction() + " on " + l.getEntityName()));

        Assertions.assertFalse(logs.isEmpty(), "Audit log should not be empty");
        Assertions.assertEquals("CREATED", logs.get(0).getAction());
        Assertions.assertEquals("Notification", logs.get(0).getEntityName());
    }
}
