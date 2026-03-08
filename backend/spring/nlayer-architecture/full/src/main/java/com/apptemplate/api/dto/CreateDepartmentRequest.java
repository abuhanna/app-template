package com.apptemplate.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDepartmentRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String name;

    private String description;
}
