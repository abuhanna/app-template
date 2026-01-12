package apptemplate.infrastructure.seeding;

import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.domain.entities.Department;
import apptemplate.domain.entities.User;
import apptemplate.domain.enums.UserRole;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
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
        if (!departmentRepository.existsByCode("IT")) {
            Department it = new Department(
                "IT",
                "Information Technology",
                "IT Department"
            );
            departmentRepository.save(it);
        }
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            Department itDept = departmentRepository.findByCode("IT")
                .orElseThrow(() -> new RuntimeException("IT Department not found"));

            User admin = new User(
                 "admin",
                 "admin@apptemplate.local",
                 passwordEncoder.encode("Admin@123"),
                 "System Administrator",
                 UserRole.ADMIN,
                 itDept.getId()
            );
            
            userRepository.save(admin);
        }
    }
}
