package com.apptemplate.api.service;

import com.apptemplate.api.dto.UploadedFileDto;
import com.apptemplate.api.exception.NotFoundException;
import com.apptemplate.api.model.UploadedFile;
import com.apptemplate.api.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    private final FileRepository fileRepository;
    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    @Transactional(readOnly = true)
    public Page<UploadedFileDto> getFiles(String search, String category, Boolean isPublic,
                                           int page, int pageSize, String sortBy, String sortOrder) {
        Sort sort = buildSort(sortBy, sortOrder, "createdAt");
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, sort);
        return fileRepository.findAllWithFilters(search, category, isPublic, pageRequest)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public UploadedFileDto getFileById(Long id) {
        UploadedFile file = fileRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("File", id));
        return mapToDto(file);
    }

    @Transactional
    public UploadedFileDto storeFile(MultipartFile file, String description, String category, boolean isPublic) {
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
            uploadedFile.setCreatedBy(getCurrentUserId());

            UploadedFile saved = fileRepository.save(uploadedFile);
            return mapToDto(saved);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename(), ex);
        }
    }

    public Resource loadFileAsResource(Long fileId) {
        try {
            UploadedFile uploadedFile = fileRepository.findById(fileId)
                    .orElseThrow(() -> new NotFoundException("File", fileId));

            Path filePath = Paths.get(uploadedFile.getStoragePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                throw new NotFoundException("File not found on disk: " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new NotFoundException("File not found");
        }
    }

    @Transactional(readOnly = true)
    public UploadedFile getFileMetadata(Long fileId) {
        return fileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File", fileId));
    }

    @Transactional
    public void deleteFile(Long fileId) {
        UploadedFile uploadedFile = fileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File", fileId));

        // Delete physical file
        try {
            Path filePath = Paths.get(uploadedFile.getStoragePath());
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.warn("Could not delete physical file: {}", ex.getMessage());
        }

        fileRepository.delete(uploadedFile);
    }

    private UploadedFileDto mapToDto(UploadedFile file) {
        return UploadedFileDto.builder()
                .id(file.getId())
                .fileName(file.getFileName())
                .originalFileName(file.getOriginalFileName())
                .contentType(file.getContentType())
                .fileSize(file.getFileSize())
                .description(file.getDescription())
                .category(file.getCategory())
                .isPublic(file.isPublic())
                .createdAt(file.getCreatedAt())
                .updatedAt(file.getUpdatedAt())
                .createdBy(file.getCreatedBy())
                .downloadUrl("/api/files/" + file.getId() + "/download")
                .build();
    }

    private Long getCurrentUserId() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof Long) {
                return (Long) principal;
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private Sort buildSort(String sortBy, String sortOrder, String defaultSortBy) {
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : defaultSortBy;
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, field);
    }
}
