package com.apptemplate.api.features.users.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;

@Data
public class UpdateUserRequest {
    private String name;

    @Email
    private String email;

    private Boolean isActive;
}
