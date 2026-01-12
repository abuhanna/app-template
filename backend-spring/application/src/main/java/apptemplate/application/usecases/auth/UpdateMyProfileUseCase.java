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



@Service
@RequiredArgsConstructor
public class UpdateMyProfileUseCase {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final UserMapper userMapper;

    @Transactional
    public UserDto execute(UpdateProfileRequest request) {
        Long userId = currentUserService.getCurrentUserId()
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
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        // The original update method call is replaced by direct setters.
        // Other fields like username, role, departmentId, and active status are not changed
        // as per the comment "cannot change username, role, or department".
        // The active status is also not changed by this profile update.

        userRepository.save(user);

        return userMapper.toDto(user);
    }
}
