package com.apptemplate.api.features.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ValidateTokenRequest {
    @NotBlank
    private String token;
}
