package com.apptemplate.api.config;

import com.apptemplate.api.model.User;
import com.apptemplate.api.repository.UserRepository;
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
            admin.setName("System Administrator");
            admin.setEmail("admin@apptemplate.local");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setActive(true);
            userRepository.save(admin);
        }
    }
}
