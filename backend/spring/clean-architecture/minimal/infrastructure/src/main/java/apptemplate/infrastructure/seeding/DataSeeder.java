package apptemplate.infrastructure.seeding;

import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.domain.entities.User;
import apptemplate.domain.enums.UserRole;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedUsers();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                 "admin",
                 "admin@apptemplate.local",
                 passwordEncoder.encode("Admin@123"),
                 "System Administrator",
                 UserRole.ADMIN,
                 null
            );

            userRepository.save(admin);
        } else {
            // Ensure admin is active if they already exist
            userRepository.findByUsername("admin").ifPresent(admin -> {
                if (!admin.isActive()) {
                    admin.setActive(true);
                    userRepository.save(admin);
                }
            });
        }
    }
}
