package apptemplate.application.ports.repositories;

import apptemplate.domain.entities.UploadedFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * Port interface for UploadedFile repository operations.
 */
public interface UploadedFileRepository {

    Optional<UploadedFile> findById(Long id);

    Page<UploadedFile> findByFilters(String search, String category, Boolean isPublic, Pageable pageable);

    UploadedFile save(UploadedFile file);

    void delete(UploadedFile file);

    void deleteById(Long id);
}
