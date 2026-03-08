package com.apptemplate.api.features.departments;

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
public class DepartmentDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    @JsonProperty("isActive")
    private boolean isActive;
    private long userCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DepartmentDto fromEntity(Department department, long userCount) {
        return DepartmentDto.builder()
                .id(department.getId())
                .code(department.getCode())
                .name(department.getName())
                .description(department.getDescription())
                .isActive(department.isActive())
                .userCount(userCount)
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .build();
    }
}
