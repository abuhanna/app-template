package com.apptemplate.api.dto;

import lombok.Data;

@Data
public class UpdateDepartmentRequest {

    private String code;
    private String name;
    private String description;
    private Boolean isActive;
}
