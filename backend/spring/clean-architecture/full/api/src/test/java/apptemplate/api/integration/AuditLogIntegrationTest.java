package apptemplate.api.integration;

import apptemplate.infrastructure.persistence.jpa.AuditLogJpaRepository;
import apptemplate.infrastructure.persistence.jpa.DepartmentJpaRepository;
import apptemplate.infrastructure.persistence.entities.DepartmentJpaEntity;
import apptemplate.infrastructure.persistence.entities.AuditLogJpaEntity;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class AuditLogIntegrationTest {

    @Autowired
    private DepartmentJpaRepository departmentRepository;

    @Autowired
    private AuditLogJpaRepository auditLogRepository;

    @Test
    public void testAuditLogCreatedOnInsert() {
        // Setup mock user
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(1L, "password")
        );

        // Create entity
        DepartmentJpaEntity department = DepartmentJpaEntity.builder()
            .code("TEST01")
            .name("Test Department")
            .isActive(true)
            .build();

        // Save entity (should trigger CREATE audit)
        departmentRepository.save(department);

        // Verify audit log
        List<AuditLogJpaEntity> logs = auditLogRepository.findAll();
        System.out.println("Logs count: " + logs.size());
        logs.forEach(l -> System.out.println("Log: " + l.getAction() + " on " + l.getEntityName()));
        
        Assertions.assertFalse(logs.isEmpty(), "Audit log should not be empty");
        Assertions.assertEquals("CREATED", logs.get(0).getAction());
        Assertions.assertEquals("Department", logs.get(0).getEntityName());
    }
}
