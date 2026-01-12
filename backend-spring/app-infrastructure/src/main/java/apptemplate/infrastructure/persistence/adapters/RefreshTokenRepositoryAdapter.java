package apptemplate.infrastructure.persistence.adapters;

import apptemplate.application.ports.repositories.RefreshTokenRepository;
import apptemplate.domain.entities.RefreshToken;
import apptemplate.infrastructure.persistence.entities.RefreshTokenJpaEntity;
import apptemplate.infrastructure.persistence.jpa.RefreshTokenJpaRepository;
import apptemplate.infrastructure.persistence.mappers.RefreshTokenEntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class RefreshTokenRepositoryAdapter implements RefreshTokenRepository {

    private final RefreshTokenJpaRepository jpaRepository;
    private final RefreshTokenEntityMapper mapper;

    @Override
    public Optional<RefreshToken> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return jpaRepository.findByToken(token).map(mapper::toDomain);
    }

    @Override
    public List<RefreshToken> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<RefreshToken> findActiveByUserId(UUID userId) {
        return jpaRepository.findActiveByUserId(userId, LocalDateTime.now()).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public RefreshToken save(RefreshToken refreshToken) {
        RefreshTokenJpaEntity entity;
        if (refreshToken.getId() != null) {
            entity = jpaRepository.findById(refreshToken.getId())
                    .orElse(mapper.toJpaEntity(refreshToken));
            mapper.updateJpaEntity(refreshToken, entity);
        } else {
            entity = mapper.toJpaEntity(refreshToken);
        }
        RefreshTokenJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional
    public void deleteByToken(String token) {
        jpaRepository.deleteByToken(token);
    }

    @Override
    @Transactional
    public void deleteByUserId(UUID userId) {
        jpaRepository.deleteByUserId(userId);
    }

    @Override
    @Transactional
    public void revokeAllByUserId(UUID userId) {
        jpaRepository.revokeAllByUserId(userId, LocalDateTime.now());
    }
}
