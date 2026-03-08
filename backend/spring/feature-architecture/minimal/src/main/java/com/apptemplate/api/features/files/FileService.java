package com.apptemplate.api.features.files;

import com.apptemplate.api.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    public UploadedFile storeFile(MultipartFile file, String description, String category, boolean isPublic) {
        try {
            Files.createDirectories(this.fileStorageLocation);

            String storedFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation);

            UploadedFile uploadedFile = new UploadedFile();
            uploadedFile.setFileName(storedFileName);
            uploadedFile.setOriginalFileName(file.getOriginalFilename());
            uploadedFile.setContentType(file.getContentType());
            uploadedFile.setFileSize(file.getSize());
            uploadedFile.setStoragePath(targetLocation.toString());
            uploadedFile.setDescription(description);
            uploadedFile.setCategory(category);
            uploadedFile.setPublic(isPublic);

            return fileRepository.save(uploadedFile);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename(), ex);
        }
    }

    public Page<UploadedFile> listFiles(int page, int pageSize, String search, String sortBy, String sortOrder,
                                         String category, Boolean isPublic) {
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        if (sortBy == null || sortBy.isBlank()) sortBy = "createdAt";
        Sort sort = "asc".equalsIgnoreCase(sortOrder) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, sort);

        return fileRepository.findAll(pageRequest);
    }

    public UploadedFile getFileById(Long id) {
        return fileRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("File not found with id " + id));
    }

    public Resource loadFileAsResource(Long fileId) {
        try {
            UploadedFile uploadedFile = getFileById(fileId);
            Path filePath = Paths.get(uploadedFile.getStoragePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                throw new NotFoundException("File not found on disk: " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found", ex);
        }
    }

    public void deleteFile(Long fileId) {
        UploadedFile uploadedFile = getFileById(fileId);

        try {
            Path filePath = Paths.get(uploadedFile.getStoragePath());
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            // Log but don't fail if physical file can't be deleted
        }

        fileRepository.delete(uploadedFile);
    }
}
