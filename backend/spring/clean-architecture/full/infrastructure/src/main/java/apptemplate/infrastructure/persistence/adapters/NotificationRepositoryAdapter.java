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


@Repository
@RequiredArgsConstructor
public class NotificationRepositoryAdapter implements NotificationRepository {

    private final NotificationJpaRepository jpaRepository;
    private final NotificationEntityMapper mapper;

    @Override
    public Optional<Notification> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Page<Notification> findByUserId(Long userId, Boolean unreadOnly, Pageable pageable) {
        return jpaRepository.findByUserId(userId, unreadOnly, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public long countUnreadByUserId(Long userId) {
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
    public void markAsRead(Long id) {
        jpaRepository.markAsRead(id, LocalDateTime.now());
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        jpaRepository.markAllAsRead(userId, LocalDateTime.now());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}
