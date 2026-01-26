package com.apptemplate.api.features.users.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private boolean isActive;
    private LocalDateTime createdAt;
}

@Data
class CreateUserRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;
}

@Data
class UpdateUserRequest {
    private String name;
    
    @Email
    private String email;
    
    private Boolean isActive;
}
