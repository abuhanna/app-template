package apptemplate.application.usecases.auth;

import apptemplate.application.dto.auth.UpdateProfileRequest;
import apptemplate.application.dto.user.UserDto;
import apptemplate.application.mappers.UserMapper;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.domain.entities.User;
import apptemplate.domain.exceptions.AuthenticationException;
import apptemplate.domain.exceptions.ConflictException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateMyProfileUseCase {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final UserMapper userMapper;

    @Transactional
    public UserDto execute(UpdateProfileRequest request) {
        UUID userId = currentUserService.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationException("User not authenticated"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException("User not found"));

        // Check email uniqueness if changed
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            userRepository.findByEmail(request.getEmail())
                    .ifPresent(existing -> {
                        throw new ConflictException("Email already in use");
                    });
        }

        // Update profile fields (cannot change username, role, or department)
        user.update(
                user.getUsername(),
                request.getEmail(),
                request.getFirstName(),
                request.getLastName(),
                user.getRole(),
                user.getDepartmentId(),
                user.isActive()
        );

        userRepository.save(user);

        return userMapper.toDto(user);
    }
}
