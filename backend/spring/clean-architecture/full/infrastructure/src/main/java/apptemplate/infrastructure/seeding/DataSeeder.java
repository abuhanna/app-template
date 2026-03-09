package apptemplate.infrastructure.seeding;

import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.domain.entities.Department;
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
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, DepartmentRepository departmentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedDepartments();
        seedUsers();
    }

    private void seedDepartments() {
        if (!departmentRepository.existsByCode("GEN")) {
            Department gen = new Department(
                "GEN",
                "General",
                "Default department"
            );
            departmentRepository.save(gen);
        }
    }

    private void seedUsers() {
        Department generalDept = departmentRepository.findByCode("GEN")
            .orElseThrow(() -> new RuntimeException("General Department not found"));

        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                 "admin",
                 "admin@apptemplate.com",
                 passwordEncoder.encode("Admin@123"),
                 "Admin User",
                 UserRole.ADMIN,
                 generalDept.getId()
            );
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("johndoe")) {
            User sampleUser = new User(
                 "johndoe",
                 "user@apptemplate.com",
                 passwordEncoder.encode("User@123"),
                 "John Doe",
                 UserRole.USER,
                 generalDept.getId()
            );
            userRepository.save(sampleUser);
        }
    }
}
