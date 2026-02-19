package apptemplate.application.usecases.user;

import apptemplate.application.dto.user.UpdateUserRequest;
import apptemplate.application.dto.user.UserDto;
import apptemplate.application.mappers.UserMapper;
import apptemplate.application.ports.repositories.DepartmentRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.domain.entities.User;
import apptemplate.domain.exceptions.ConflictException;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class UpdateUserUseCase {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final UserMapper userMapper;

    @Transactional
    public UserDto execute(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User", id));

        // Check username uniqueness if changed
        if (!user.getUsername().equals(request.getUsername())) {
            userRepository.findByUsername(request.getUsername())
                    .ifPresent(existing -> {
                        throw new ConflictException("Username already exists");
                    });
        }

        // Check email uniqueness if changed
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            userRepository.findByEmail(request.getEmail())
                    .ifPresent(existing -> {
                        throw new ConflictException("Email already in use");
                    });
        }

        // Validate department exists if provided
        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new NotFoundException("Department", request.getDepartmentId()));
        }

        // Update user
        String fullName = (request.getFirstName() + " " + request.getLastName()).trim();
        user.update(
                request.getUsername(),
                fullName,
                request.getEmail(),
                request.getRole(),
                request.getDepartmentId(),
                request.getIsActive()
        );

        userRepository.save(user);

        return userMapper.toDto(user);
    }
}
