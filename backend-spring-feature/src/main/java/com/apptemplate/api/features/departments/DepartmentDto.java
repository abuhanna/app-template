package com.apptemplate.api.features.departments;

import lombok.Data;

@Data
public class DepartmentDto {
    private Long id;
    private String name;
    private String code;
    private String description;
}
