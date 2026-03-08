package com.apptemplate.api.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {

    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Long departmentId;
    private Boolean isActive;
}
