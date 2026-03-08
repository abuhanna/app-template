package com.apptemplate.api.controller;

import com.apptemplate.api.dto.PagedResult;
import com.apptemplate.api.model.UploadedFile;
import com.apptemplate.api.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File management endpoints")
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    @Operation(summary = "Upload file", description = "Upload a file to the server")
    public ResponseEntity<UploadedFile> uploadFile(@RequestParam("file") MultipartFile file) {
        UploadedFile uploadedFile = fileService.storeFile(file);
        return ResponseEntity.ok(uploadedFile);
    }

    @GetMapping
    @Operation(summary = "List files", description = "Get paginated list of uploaded files")
    public ResponseEntity<PagedResult<UploadedFile>> listFiles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);
        Page<UploadedFile> files = fileService.listFiles(PageRequest.of(page - 1, pageSize, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(PagedResult.fromPage(files));
    }

    @GetMapping("/download/{id}")
    @Operation(summary = "Download file", description = "Download a file by ID")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        Resource resource = fileService.loadFileAsResource(id);
        UploadedFile metadata = fileService.getFileMetadata(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete file", description = "Delete a file by ID")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return ResponseEntity.ok().build();
    }
}
