package apptemplate.application.usecases.file;

import apptemplate.application.ports.repositories.UploadedFileRepository;
import apptemplate.application.ports.services.FileStorageService;
import apptemplate.domain.entities.UploadedFile;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeleteFileUseCase {

    private final UploadedFileRepository fileRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public void execute(Long id) {
        log.info("Deleting file with ID: {}", id);

        UploadedFile file = fileRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("File not found with id: " + id));

        // Delete from storage
        fileStorageService.deleteFile(file.getStoragePath());

        // Delete from database
        fileRepository.delete(file);

        log.info("File deleted successfully: {}", id);
    }
}
