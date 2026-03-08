package com.apptemplate.api.features.files;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.apptemplate.api.common.audit.AuditEntityListener;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "uploaded_files")
@EntityListeners(AuditEntityListener.class)
public class UploadedFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false, unique = true, length = 255)
    private String fileName;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;

    @Column(length = 500)
    private String description;

    @Column(length = 100)
    private String category;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;

    @Column(name = "created_by")
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Transient
    public String getDownloadUrl() {
        return "/api/files/" + id + "/download";
    }
}
