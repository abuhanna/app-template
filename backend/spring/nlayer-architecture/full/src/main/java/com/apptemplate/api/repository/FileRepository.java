package com.apptemplate.api.repository;

import com.apptemplate.api.model.UploadedFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepository extends JpaRepository<UploadedFile, Long> {

    @Query("SELECT f FROM UploadedFile f WHERE " +
           "(:search IS NULL OR LOWER(f.originalFileName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR f.category = :category) " +
           "AND (:isPublic IS NULL OR f.isPublic = :isPublic)")
    Page<UploadedFile> findAllWithFilters(
            @Param("search") String search,
            @Param("category") String category,
            @Param("isPublic") Boolean isPublic,
            Pageable pageable);
}
