package apptemplate.infrastructure.config;

import apptemplate.application.ports.services.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@RequiredArgsConstructor
public class JpaAuditingConfig {

    private final CurrentUserService currentUserService;

    @Bean
    public AuditorAware<Long> auditorProvider() {
        return () -> currentUserService.getCurrentUserId()
                .or(() -> Optional.of(0L)); // System user ID
    }
}
