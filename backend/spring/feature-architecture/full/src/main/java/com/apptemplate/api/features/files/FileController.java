package com.apptemplate.api.features.files;

import com.apptemplate.api.common.dto.ApiResponse;
import com.apptemplate.api.common.dto.PagedResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Files", description = "File management endpoints")
public class FileController {

    private final FileService fileService;

    @GetMapping
    @Operation(summary = "Get all files", description = "Get paginated list of files with optional filters")
    public ResponseEntity<ApiResponse<PagedResult<UploadedFileDto>>> getFiles(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Search by file name or description") @RequestParam(required = false) String search,
            @Parameter(description = "Column to sort by") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort order: asc or desc") @RequestParam(defaultValue = "desc") String sortOrder,
            @Parameter(description = "Filter by category") @RequestParam(required = false) String category,
            @Parameter(description = "Filter by public status") @RequestParam(required = false) Boolean isPublic
    ) {
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        Page<UploadedFileDto> files = fileService.getFiles(search, category, isPublic, page, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(ApiResponse.success(PagedResult.fromPage(files), "Files retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get file metadata", description = "Get file metadata by its ID")
    public ResponseEntity<ApiResponse<UploadedFileDto>> getFileById(@PathVariable Long id) {
        UploadedFileDto file = fileService.getFileById(id);
        return ResponseEntity.ok(ApiResponse.success(file));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload file", description = "Upload a new file")
    public ResponseEntity<ApiResponse<UploadedFileDto>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "false") boolean isPublic
    ) {
        log.info("Uploading file: {}, Size: {}", file.getOriginalFilename(), file.getSize());
        UploadedFileDto uploadedFile = fileService.storeFile(file, description, category, isPublic);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(uploadedFile, "File uploaded successfully"));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download file", description = "Download a file by its ID")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        Resource resource = fileService.loadFileAsResource(id);
        UploadedFile metadata = fileService.getFileMetadata(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + metadata.getOriginalFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete file", description = "Delete a file by its ID")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }
}
