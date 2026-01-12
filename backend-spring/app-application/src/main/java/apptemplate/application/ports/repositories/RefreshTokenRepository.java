package apptemplate.application.ports.repositories;

import apptemplate.domain.entities.RefreshToken;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port interface for RefreshToken repository operations.
 */
public interface RefreshTokenRepository {

    Optional<RefreshToken> findById(UUID id);

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUserId(UUID userId);

    List<RefreshToken> findActiveByUserId(UUID userId);

    RefreshToken save(RefreshToken refreshToken);

    void deleteByToken(String token);

    void deleteByUserId(UUID userId);

    void revokeAllByUserId(UUID userId);
}
