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
    public AuditorAware<String> auditorProvider() {
        return () -> currentUserService.getCurrentUsername()
                .or(() -> Optional.of("system"));
    }
}
