package apptemplate.application.usecases.file;

import apptemplate.application.dto.file.UploadedFileDto;
import apptemplate.application.mappers.UploadedFileMapper;
import apptemplate.application.ports.repositories.UploadedFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetFilesUseCase {

    private final UploadedFileRepository fileRepository;
    private final UploadedFileMapper fileMapper;

    // Map of allowed sort fields to actual entity field names
    private static final java.util.Map<String, String> SORT_FIELD_MAP = java.util.Map.of(
            "fileName", "fileName",
            "filename", "fileName",
            "createdAt", "createdAt",
            "createdat", "createdAt",
            "fileSize", "fileSize",
            "filesize", "fileSize",
            "category", "category",
            "isPublic", "isPublic",
            "ispublic", "isPublic"
    );

    @Transactional(readOnly = true)
    public Page<UploadedFileDto> execute(String search, String category, Boolean isPublic,
                                          int page, int pageSize, String sortBy, String sortDir) {
        // Convert 1-based page to 0-based for Spring Data
        int zeroBasedPage = page - 1;

        // Build sorting
        Sort sort = buildSort(sortBy, sortDir);

        // Create pageable
        Pageable pageable = PageRequest.of(zeroBasedPage, pageSize, sort);

        // Format search string with wildcards if present
        if (search != null && !search.isBlank()) {
            search = "%" + search + "%";
        } else {
            search = null;
        }

        return fileRepository.findByFilters(search, category, isPublic, pageable)
            .map(fileMapper::toDto);
    }

    private Sort buildSort(String sortBy, String sortDir) {
        if (sortBy == null || sortBy.isBlank()) {
            // Default sort by createdAt descending
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        // Map the sort field to actual entity field
        String actualField = SORT_FIELD_MAP.getOrDefault(sortBy.toLowerCase(), sortBy);

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir)
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;

        return Sort.by(direction, actualField);
    }
}
