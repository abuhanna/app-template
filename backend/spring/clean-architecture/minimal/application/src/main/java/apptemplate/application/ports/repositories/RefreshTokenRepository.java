package apptemplate.application.ports.repositories;

import apptemplate.domain.entities.RefreshToken;

import java.util.List;
import java.util.Optional;


/**
 * Port interface for RefreshToken repository operations.
 */
public interface RefreshTokenRepository {

    Optional<RefreshToken> findById(Long id);

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUserId(Long userId);

    List<RefreshToken> findActiveByUserId(Long userId);

    RefreshToken save(RefreshToken refreshToken);

    void deleteByToken(String token);

    void deleteByUserId(Long userId);

    void revokeAllByUserId(Long userId);
}
