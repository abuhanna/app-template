package com.apptemplate.api.features.files;

import com.apptemplate.api.common.dto.ApiResponse;
import com.apptemplate.api.common.dto.PagedResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
@Tag(name = "Files", description = "File management endpoints")
public class FileController {

    private final FileService fileService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload file", description = "Upload a file to the server")
    public ResponseEntity<ApiResponse<UploadedFileDto>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "false") boolean isPublic) {
        UploadedFile uploadedFile = fileService.storeFile(file, description, category, isPublic);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(UploadedFileDto.fromEntity(uploadedFile), "File uploaded successfully"));
    }

    @GetMapping
    @Operation(summary = "List files", description = "Get paginated list of uploaded files")
    public ResponseEntity<PagedResult<UploadedFileDto>> listFiles(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Search term") @RequestParam(required = false) String search,
            @Parameter(description = "Column to sort by") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort order: asc or desc") @RequestParam(defaultValue = "desc") String sortOrder,
            @Parameter(description = "Filter by category") @RequestParam(required = false) String category,
            @Parameter(description = "Filter by public status") @RequestParam(required = false) Boolean isPublic) {
        Page<UploadedFile> files = fileService.listFiles(page, pageSize, search, sortBy, sortOrder, category, isPublic);
        Page<UploadedFileDto> dtoPage = files.map(UploadedFileDto::fromEntity);
        return ResponseEntity.ok(PagedResult.fromPage(dtoPage));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get file metadata", description = "Get file metadata by ID")
    public ResponseEntity<ApiResponse<UploadedFileDto>> getFileMetadata(@PathVariable Long id) {
        UploadedFile file = fileService.getFileById(id);
        return ResponseEntity.ok(ApiResponse.success(UploadedFileDto.fromEntity(file), "File retrieved successfully"));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download file", description = "Download a file by ID")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        Resource resource = fileService.loadFileAsResource(id);
        UploadedFile metadata = fileService.getFileById(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete file", description = "Delete a file by ID")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }
}
