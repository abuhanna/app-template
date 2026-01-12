package apptemplate.infrastructure.persistence.adapters;

import apptemplate.application.ports.repositories.NotificationRepository;
import apptemplate.domain.entities.Notification;
import apptemplate.infrastructure.persistence.entities.NotificationJpaEntity;
import apptemplate.infrastructure.persistence.jpa.NotificationJpaRepository;
import apptemplate.infrastructure.persistence.mappers.NotificationEntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class NotificationRepositoryAdapter implements NotificationRepository {

    private final NotificationJpaRepository jpaRepository;
    private final NotificationEntityMapper mapper;

    @Override
    public Optional<Notification> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Page<Notification> findByUserId(UUID userId, Boolean unreadOnly, Pageable pageable) {
        return jpaRepository.findByUserId(userId, unreadOnly, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public long countUnreadByUserId(UUID userId) {
        return jpaRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public Notification save(Notification notification) {
        NotificationJpaEntity entity;
        if (notification.getId() != null) {
            entity = jpaRepository.findById(notification.getId())
                    .orElse(mapper.toJpaEntity(notification));
            mapper.updateJpaEntity(notification, entity);
        } else {
            entity = mapper.toJpaEntity(notification);
        }
        NotificationJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional
    public void markAsRead(UUID id) {
        jpaRepository.markAsRead(id, LocalDateTime.now());
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        jpaRepository.markAllAsRead(userId, LocalDateTime.now());
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
