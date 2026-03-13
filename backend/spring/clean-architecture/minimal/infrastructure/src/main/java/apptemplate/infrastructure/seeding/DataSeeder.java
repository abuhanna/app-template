package apptemplate.infrastructure.seeding;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Data seeder for minimal variant.
 * No seed data required since there are no users/departments tables.
 */
@Component
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = false)
@Slf4j
public class DataSeeder implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        log.info("Minimal variant: no seed data required (external auth, no users table)");
    }
}
