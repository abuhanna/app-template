package apptemplate.infrastructure.services;

import apptemplate.application.ports.services.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    private final Path storagePath;

    public FileStorageServiceImpl(@Value("${file-storage.path:uploads}") String path) {
        this.storagePath = Paths.get(path).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storagePath);
            log.info("File storage directory initialized: {}", this.storagePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Override
    public FileStorageResult saveFile(InputStream inputStream, String originalFileName, String contentType) {
        try {
            // Generate unique filename
            String extension = getFileExtension(originalFileName);
            String uniqueFileName = UUID.randomUUID().toString() + extension;

            // Create year/month subfolder structure
            String subFolder = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
            Path folderPath = storagePath.resolve(subFolder);
            Files.createDirectories(folderPath);

            Path filePath = folderPath.resolve(uniqueFileName);
            String relativeStoragePath = subFolder + "/" + uniqueFileName;

            Files.copy(inputStream, filePath);

            log.info("File saved: {} -> {}", originalFileName, relativeStoragePath);

            return new FileStorageResult(uniqueFileName, relativeStoragePath);
        } catch (IOException e) {
            log.error("Failed to save file: {}", e.getMessage());
            throw new RuntimeException("Failed to save file", e);
        }
    }

    @Override
    public InputStream getFile(String storagePath) {
        try {
            Path filePath = this.storagePath.resolve(storagePath).normalize();
            if (!Files.exists(filePath)) {
                log.warn("File not found: {}", storagePath);
                return null;
            }
            return new FileInputStream(filePath.toFile());
        } catch (FileNotFoundException e) {
            log.warn("File not found: {}", storagePath);
            return null;
        }
    }

    @Override
    public void deleteFile(String storagePath) {
        try {
            Path filePath = this.storagePath.resolve(storagePath).normalize();
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted: {}", storagePath);
            } else {
                log.warn("File not found for deletion: {}", storagePath);
            }
        } catch (IOException e) {
            log.error("Failed to delete file: {}", e.getMessage());
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    @Override
    public boolean fileExists(String storagePath) {
        Path filePath = this.storagePath.resolve(storagePath).normalize();
        return Files.exists(filePath);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return "";
        int dotIndex = fileName.lastIndexOf('.');
        return dotIndex > 0 ? fileName.substring(dotIndex) : "";
    }
}
