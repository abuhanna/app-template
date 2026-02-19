package apptemplate.application.usecases.file;

import apptemplate.application.dto.file.UploadedFileDto;
import apptemplate.application.mappers.UploadedFileMapper;
import apptemplate.application.ports.repositories.UploadedFileRepository;
import apptemplate.application.ports.services.FileStorageService;
import apptemplate.domain.entities.UploadedFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class UploadFileUseCase {

    private final UploadedFileRepository fileRepository;
    private final FileStorageService fileStorageService;
    private final UploadedFileMapper fileMapper;

    @Transactional
    public UploadedFileDto execute(MultipartFile file, String description, String category, boolean isPublic) {
        log.info("Uploading file: {}", file.getOriginalFilename());

        try {
            // Save file to storage
            var result = fileStorageService.saveFile(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType()
            );

            // Create database record
            UploadedFile uploadedFile = UploadedFile.builder()
                .fileName(result.fileName())
                .originalFileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(result.storagePath())
                .description(description)
                .category(category)
                .isPublic(isPublic)
                .build();

            uploadedFile = fileRepository.save(uploadedFile);

            log.info("File uploaded successfully: {} (ID: {})", file.getOriginalFilename(), uploadedFile.getId());

            return fileMapper.toDto(uploadedFile);
        } catch (IOException e) {
            log.error("Failed to upload file: {}", e.getMessage());
            throw new RuntimeException("Failed to upload file", e);
        }
    }
}
