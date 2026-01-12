package apptemplate.application.usecases.user;

import apptemplate.application.dto.user.UserDto;
import apptemplate.application.mappers.UserMapper;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.domain.entities.User;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetUserByIdUseCase {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public UserDto execute(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User", id));

        return userMapper.toDto(user);
    }
}
