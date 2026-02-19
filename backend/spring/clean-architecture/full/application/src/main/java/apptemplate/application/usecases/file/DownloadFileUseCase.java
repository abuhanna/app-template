package apptemplate.application.usecases.file;

import apptemplate.application.ports.repositories.UploadedFileRepository;
import apptemplate.application.ports.services.FileStorageService;
import apptemplate.domain.entities.UploadedFile;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class DownloadFileUseCase {

    private final UploadedFileRepository fileRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public FileDownloadResult execute(Long id) {
        UploadedFile file = fileRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("File not found with id: " + id));

        InputStream inputStream = fileStorageService.getFile(file.getStoragePath());
        if (inputStream == null) {
            log.warn("File storage not found: {}", file.getStoragePath());
            throw new NotFoundException("File not found in storage");
        }

        return new FileDownloadResult(
            inputStream,
            file.getContentType(),
            file.getOriginalFileName()
        );
    }

    public record FileDownloadResult(
        InputStream inputStream,
        String contentType,
        String fileName
    ) {}
}
