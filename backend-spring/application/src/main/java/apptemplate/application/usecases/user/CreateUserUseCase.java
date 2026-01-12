package apptemplate.application.usecases.user;

import apptemplate.application.dto.user.CreateUserRequest;
import apptemplate.application.dto.user.UserDto;
import apptemplate.application.mappers.UserMapper;
import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.application.ports.services.PasswordService;
import apptemplate.domain.entities.User;
import apptemplate.domain.exceptions.ConflictException;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateUserUseCase {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordService passwordService;
    private final UserMapper userMapper;

    @Transactional
    public UserDto execute(CreateUserRequest request) {
        // Check username uniqueness
        userRepository.findByUsername(request.getUsername())
                .ifPresent(existing -> {
                    throw new ConflictException("Username already exists");
                });

        // Check email uniqueness
        userRepository.findByEmail(request.getEmail())
                .ifPresent(existing -> {
                    throw new ConflictException("Email already in use");
                });

        // Validate department exists if provided
        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new NotFoundException("Department", request.getDepartmentId()));
        }

        // Hash password
        String passwordHash = passwordService.hashPassword(request.getPassword());

        // Create user
        String fullName = (request.getFirstName() + " " + request.getLastName()).trim();
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordHash)
                .name(fullName)
                .role(request.getRole())
                .departmentId(request.getDepartmentId())
                .active(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        userRepository.save(user);

        return userMapper.toDto(user);
    }
}
