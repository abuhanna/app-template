package apptemplate.application.ports.services;

import java.io.InputStream;

/**
 * Port interface for file storage operations.
 */
public interface FileStorageService {

    /**
     * Saves a file to storage.
     * @return FileStorageResult containing the unique fileName and storagePath
     */
    FileStorageResult saveFile(InputStream inputStream, String originalFileName, String contentType);

    /**
     * Gets a file from storage.
     * @return InputStream of the file, or null if not found
     */
    InputStream getFile(String storagePath);

    /**
     * Deletes a file from storage.
     */
    void deleteFile(String storagePath);

    /**
     * Checks if a file exists in storage.
     */
    boolean fileExists(String storagePath);

    record FileStorageResult(String fileName, String storagePath) {}
}
