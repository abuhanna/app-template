package apptemplate.api.integration;

import apptemplate.infrastructure.persistence.jpa.AuditLogJpaRepository;
import apptemplate.infrastructure.persistence.entities.AuditLogJpaEntity;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class AuditLogIntegrationTest {

    @Autowired
    private AuditLogJpaRepository auditLogRepository;

    @Test
    public void testAuditLogCanBeSavedAndRetrieved() {
        AuditLogJpaEntity log = AuditLogJpaEntity.builder()
            .entityName("Notification")
            .entityId("1")
            .action("CREATED")
            .userId("test-user-id")
            .userName("testuser")
            .details("Test audit log entry")
            .createdAt(LocalDateTime.now())
            .build();

        auditLogRepository.save(log);

        List<AuditLogJpaEntity> logs = auditLogRepository.findAll();
        Assertions.assertFalse(logs.isEmpty(), "Audit log should not be empty");

        AuditLogJpaEntity savedLog = logs.stream()
            .filter(l -> "Notification".equals(l.getEntityName()))
            .findFirst()
            .orElse(null);
        Assertions.assertNotNull(savedLog, "Should find the saved audit log");
        Assertions.assertEquals("CREATED", savedLog.getAction());
        Assertions.assertEquals("test-user-id", savedLog.getUserId());
    }
}
