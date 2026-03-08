package com.apptemplate.api.common.config;

import com.apptemplate.api.features.users.User;
import com.apptemplate.api.features.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@apptemplate.local").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@apptemplate.com");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setRole("admin");
            admin.setActive(true);
            userRepository.save(admin);
        }
    }
}
