package com.apptemplate.api.common.audit;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class AuditListenerConfig {

    private final AuditLogRepository auditLogRepository;

    @PostConstruct
    public void init() {
        AuditEntityListener.setAuditLogRepository(auditLogRepository);
    }
}
