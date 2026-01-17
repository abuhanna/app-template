package apptemplate.infrastructure.persistence.adapters;

import apptemplate.application.ports.repositories.UploadedFileRepository;
import apptemplate.domain.entities.UploadedFile;
import apptemplate.infrastructure.persistence.entities.UploadedFileJpaEntity;
import apptemplate.infrastructure.persistence.jpa.UploadedFileJpaRepository;
import apptemplate.infrastructure.persistence.mappers.UploadedFileEntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UploadedFileRepositoryAdapter implements UploadedFileRepository {

    private final UploadedFileJpaRepository jpaRepository;
    private final UploadedFileEntityMapper mapper;

    @Override
    public Optional<UploadedFile> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Page<UploadedFile> findByFilters(String category, Boolean isPublic, Pageable pageable) {
        return jpaRepository.findByFilters(category, isPublic, pageable)
            .map(mapper::toDomain);
    }

    @Override
    public UploadedFile save(UploadedFile file) {
        UploadedFileJpaEntity entity = mapper.toEntity(file);
        entity = jpaRepository.save(entity);
        return mapper.toDomain(entity);
    }

    @Override
    public void delete(UploadedFile file) {
        jpaRepository.deleteById(file.getId());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}
