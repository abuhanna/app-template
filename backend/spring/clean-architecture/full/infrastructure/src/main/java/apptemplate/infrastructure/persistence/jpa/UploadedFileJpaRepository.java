package apptemplate.infrastructure.persistence.jpa;

import apptemplate.infrastructure.persistence.entities.UploadedFileJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UploadedFileJpaRepository extends JpaRepository<UploadedFileJpaEntity, Long> {

    @Query("SELECT f FROM UploadedFileJpaEntity f WHERE " +
           "(:search IS NULL OR " +
           "    LOWER(f.fileName) LIKE LOWER(CAST(:search AS string)) OR " +
           "    LOWER(f.originalFileName) LIKE LOWER(CAST(:search AS string)) OR " +
           "    LOWER(f.description) LIKE LOWER(CAST(:search AS string))) AND " +
           "(:category IS NULL OR f.category = :category) AND " +
           "(:isPublic IS NULL OR f.isPublic = :isPublic)")
    Page<UploadedFileJpaEntity> findByFilters(
        @Param("search") String search,
        @Param("category") String category,
        @Param("isPublic") Boolean isPublic,
        Pageable pageable
    );
}
