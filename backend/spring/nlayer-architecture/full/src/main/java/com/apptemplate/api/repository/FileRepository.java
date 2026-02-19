package com.apptemplate.api.repository;

import com.apptemplate.api.model.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileRepository extends JpaRepository<UploadedFile, Long> {
}
