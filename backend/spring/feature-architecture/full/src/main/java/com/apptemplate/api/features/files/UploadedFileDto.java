package com.apptemplate.api.features.files;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadedFileDto {
    private Long id;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private String description;
    private String category;
    @JsonProperty("isPublic")
    private boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private String downloadUrl;

    public static UploadedFileDto fromEntity(UploadedFile file) {
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
                .downloadUrl(file.getDownloadUrl())
                .build();
    }
}
