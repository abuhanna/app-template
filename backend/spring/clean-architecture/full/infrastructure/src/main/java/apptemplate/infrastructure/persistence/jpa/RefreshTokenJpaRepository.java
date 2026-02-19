package apptemplate.infrastructure.persistence.jpa;

import apptemplate.infrastructure.persistence.entities.RefreshTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface RefreshTokenJpaRepository extends JpaRepository<RefreshTokenJpaEntity, Long> {

    Optional<RefreshTokenJpaEntity> findByToken(String token);

    List<RefreshTokenJpaEntity> findByUserId(Long userId);

    @Query("SELECT t FROM RefreshTokenJpaEntity t WHERE t.userId = :userId AND t.revokedAt IS NULL AND t.expiresAt > :now")
    List<RefreshTokenJpaEntity> findActiveByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    void deleteByToken(String token);

    void deleteByUserId(Long userId);

    @Modifying
    @Query("UPDATE RefreshTokenJpaEntity t SET t.revokedAt = :revokedAt WHERE t.userId = :userId AND t.revokedAt IS NULL")
    void revokeAllByUserId(@Param("userId") Long userId, @Param("revokedAt") LocalDateTime revokedAt);
}
