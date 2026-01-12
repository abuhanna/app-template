package apptemplate.application.usecases.auth;

import apptemplate.application.dto.user.UserDto;
import apptemplate.application.mappers.UserMapper;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.domain.entities.User;
import apptemplate.domain.exceptions.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetMyProfileUseCase {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public UserDto execute() {
        UUID userId = currentUserService.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationException("User not authenticated"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException("User not found"));

        return userMapper.toDto(user);
    }
}
