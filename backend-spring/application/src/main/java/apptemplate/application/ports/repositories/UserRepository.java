package apptemplate.application.ports.repositories;

import apptemplate.domain.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port interface for User repository operations.
 */
public interface UserRepository {

    Optional<User> findById(UUID id);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPasswordResetToken(String token);

    List<User> findAll();

    Page<User> findByFilters(String search, UUID departmentId, Boolean isActive, Pageable pageable);

    List<User> findByRole(String role);

    long countByDepartmentId(UUID departmentId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsernameAndIdNot(String username, UUID id);

    boolean existsByEmailAndIdNot(String email, UUID id);

    User save(User user);

    void delete(User user);

    void deleteById(UUID id);
}
