package com.apptemplate.api.service;

import com.apptemplate.api.dto.CreateUserRequest;
import com.apptemplate.api.dto.UpdateUserRequest;
import com.apptemplate.api.dto.UserDto;
import com.apptemplate.api.exception.ConflictException;
import com.apptemplate.api.exception.NotFoundException;
import com.apptemplate.api.model.Department;
import com.apptemplate.api.model.User;
import com.apptemplate.api.repository.DepartmentRepository;
import com.apptemplate.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public Page<UserDto> getUsers(String search, Boolean isActive, Long departmentId,
                                   int page, int pageSize, String sortBy, String sortOrder) {
        Sort sort = buildSort(sortBy, sortOrder, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Page<User> users = userRepository.findAllWithFilters(search, isActive, departmentId, pageable);
        return users.map(this::mapToDto);
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User", id));
        return mapToDto(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("User with this email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("User with this username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : "user");
        user.setDepartmentId(request.getDepartmentId());
        user.setActive(true);

        String firstName = request.getFirstName() != null ? request.getFirstName() : request.getUsername();
        String lastName = request.getLastName() != null ? request.getLastName() : "";
        user.setFirstName(firstName);
        user.setLastName(lastName);

        User savedUser = userRepository.save(user);

        auditLogService.log("create", "User", savedUser.getId().toString(),
                null, null, "User created: " + savedUser.getUsername(), null);

        return mapToDto(savedUser);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User", id));

        if (request.getUsername() != null) {
            if (!request.getUsername().equals(user.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
                throw new ConflictException("Username already taken");
            }
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new ConflictException("Email already taken");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getDepartmentId() != null) {
            user.setDepartmentId(request.getDepartmentId());
        }
        if (request.getIsActive() != null) {
            user.setActive(request.getIsActive());
        }

        User savedUser = userRepository.save(user);

        auditLogService.log("update", "User", savedUser.getId().toString(),
                null, null, "User updated: " + savedUser.getUsername(), null);

        return mapToDto(savedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User", id));

        // Soft delete
        user.setActive(false);
        userRepository.save(user);

        auditLogService.log("delete", "User", id.toString(),
                null, null, "User soft-deleted: " + user.getUsername(), null);
    }

    private UserDto mapToDto(User user) {
        String departmentName = null;
        if (user.getDepartmentId() != null) {
            departmentName = departmentRepository.findById(user.getDepartmentId())
                    .map(Department::getName)
                    .orElse(null);
        }

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .role(user.getRole())
                .departmentId(user.getDepartmentId())
                .departmentName(departmentName)
                .isActive(user.isActive())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private Sort buildSort(String sortBy, String sortOrder, String defaultSortBy) {
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : defaultSortBy;
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, field);
    }
}
