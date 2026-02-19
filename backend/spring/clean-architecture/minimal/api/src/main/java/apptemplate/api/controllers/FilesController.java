package apptemplate.api.controllers;

import apptemplate.api.dto.ApiResponse;
import apptemplate.api.dto.PagedResponse;
import apptemplate.application.dto.file.UploadedFileDto;
import apptemplate.application.usecases.file.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
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
public class FilesController {

    private final UploadFileUseCase uploadFileUseCase;
    private final GetFilesUseCase getFilesUseCase;
    private final GetFileByIdUseCase getFileByIdUseCase;
    private final DownloadFileUseCase downloadFileUseCase;
    private final DeleteFileUseCase deleteFileUseCase;

    @GetMapping
    @Operation(summary = "Get all files", description = "Get paginated list of files with optional filters")
    public ResponseEntity<PagedResponse<UploadedFileDto>> getFiles(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "20") int pageSize,
            @Parameter(description = "Column to sort by (e.g., fileName, createdAt)") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Search by file name or description") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by category") @RequestParam(required = false) String category,
            @Parameter(description = "Filter by public status") @RequestParam(required = false) Boolean isPublic
    ) {
        // Ensure page is at least 1 and cap pageSize at 100
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        Page<UploadedFileDto> files = getFilesUseCase.execute(search, category, isPublic, page, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(PagedResponse.from(files));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get file by ID", description = "Get file metadata by its ID")
    public ResponseEntity<UploadedFileDto> getFileById(@PathVariable Long id) {
        UploadedFileDto file = getFileByIdUseCase.execute(id);
        return ResponseEntity.ok(file);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload file", description = "Upload a new file")
    public ResponseEntity<UploadedFileDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "false") boolean isPublic
    ) {
        log.info("Uploading file: {}, Size: {}", file.getOriginalFilename(), file.getSize());
        UploadedFileDto uploadedFile = uploadFileUseCase.execute(file, description, category, isPublic);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(uploadedFile);
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download file", description = "Download a file by its ID")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        var result = downloadFileUseCase.execute(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(result.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + result.fileName() + "\"")
                .body(new InputStreamResource(result.inputStream()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete file", description = "Delete a file by its ID")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        deleteFileUseCase.execute(id);
        return ResponseEntity.ok().build();
    }
}
