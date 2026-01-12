package apptemplate.application.usecases.user;

import apptemplate.application.dto.user.UserDto;
import apptemplate.application.mappers.UserMapper;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.domain.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class GetUsersUseCase {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public Page<UserDto> execute(String search, Long departmentId, Boolean isActive, Pageable pageable) {
        Page<User> users = userRepository.findByFilters(search, departmentId, isActive, pageable);
        return users.map(userMapper::toDto);
    }
}
