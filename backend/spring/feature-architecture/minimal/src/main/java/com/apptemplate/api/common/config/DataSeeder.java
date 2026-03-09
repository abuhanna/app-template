package com.apptemplate.api.common.config;

import com.apptemplate.api.features.users.User;
import com.apptemplate.api.features.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = false)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@apptemplate.com").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@apptemplate.com");
            admin.setPasswordHash("");
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole("admin");
            admin.setActive(true);
            userRepository.save(admin);
        }
    }
}
