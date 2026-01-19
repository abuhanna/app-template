package apptemplate.application.usecases.user;

import apptemplate.application.dto.user.UserDto;
import apptemplate.application.mappers.UserMapper;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.domain.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class GetUsersUseCase {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    // Map of allowed sort fields to actual entity field names
    private static final java.util.Map<String, String> SORT_FIELD_MAP = java.util.Map.of(
            "username", "username",
            "email", "email",
            "firstName", "firstName",
            "lastname", "lastName",
            "lastName", "lastName",
            "createdAt", "createdAt",
            "createdat", "createdAt",
            "isActive", "isActive",
            "isactive", "isActive"
    );

    @Transactional(readOnly = true)
    public Page<UserDto> execute(String search, Long departmentId, Boolean isActive,
                                  int page, int pageSize, String sortBy, String sortDir) {
        // Convert 1-based page to 0-based for Spring Data
        int zeroBasedPage = page - 1;

        // Build sorting
        Sort sort = buildSort(sortBy, sortDir);

        // Create pageable
        Pageable pageable = PageRequest.of(zeroBasedPage, pageSize, sort);

        Page<User> users = userRepository.findByFilters(search, departmentId, isActive, pageable);
        return users.map(userMapper::toDto);
    }

    private Sort buildSort(String sortBy, String sortDir) {
        if (sortBy == null || sortBy.isBlank()) {
            // Default sort by createdAt descending
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        // Map the sort field to actual entity field
        String actualField = SORT_FIELD_MAP.getOrDefault(sortBy.toLowerCase(), sortBy);

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir)
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;

        return Sort.by(direction, actualField);
    }
}
