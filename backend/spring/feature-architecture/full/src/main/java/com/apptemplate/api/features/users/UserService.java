package com.apptemplate.api.features.users;

import com.apptemplate.api.common.exception.ConflictException;
import com.apptemplate.api.common.exception.NotFoundException;
import com.apptemplate.api.features.users.dto.CreateUserRequest;
import com.apptemplate.api.features.users.dto.UpdateUserRequest;
import com.apptemplate.api.features.users.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserDto> getUsers(String search, Boolean isActive, Long departmentId,
                                  int page, int pageSize, String sortBy, String sortOrder) {
        Sort sort = buildSort(sortBy, sortOrder, "createdAt");
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, sort);
        return userRepository.findWithFilters(search, isActive, departmentId, pageRequest)
                .map(UserDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id " + id));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole() != null ? request.getRole() : "user");
        user.setDepartmentId(request.getDepartmentId());
        user.setActive(request.getIsActive() != null ? request.getIsActive() : true);

        User savedUser = userRepository.save(user);
        return UserDto.fromEntity(savedUser);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id " + id));

        if (request.getUsername() != null) {
            if (!request.getUsername().equals(user.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
                throw new ConflictException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new ConflictException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getDepartmentId() != null) user.setDepartmentId(request.getDepartmentId());
        if (request.getIsActive() != null) user.setActive(request.getIsActive());

        User savedUser = userRepository.save(user);
        return UserDto.fromEntity(savedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id " + id));
        // Soft delete
        user.setActive(false);
        userRepository.save(user);
    }

    private Sort buildSort(String sortBy, String sortOrder, String defaultSortBy) {
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : defaultSortBy;
        return "asc".equalsIgnoreCase(sortOrder) ? Sort.by(field).ascending() : Sort.by(field).descending();
    }
}
