package apptemplate.application.usecases.file;

import apptemplate.application.dto.file.UploadedFileDto;
import apptemplate.application.mappers.UploadedFileMapper;
import apptemplate.application.ports.repositories.UploadedFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetFilesUseCase {

    private final UploadedFileRepository fileRepository;
    private final UploadedFileMapper fileMapper;

    @Transactional(readOnly = true)
    public Page<UploadedFileDto> execute(String category, Boolean isPublic, Pageable pageable) {
        return fileRepository.findByFilters(category, isPublic, pageable)
            .map(fileMapper::toDto);
    }
}
