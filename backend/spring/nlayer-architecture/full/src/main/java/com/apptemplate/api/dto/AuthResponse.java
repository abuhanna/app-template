package com.apptemplate.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private UserInfoDto user;

    public static AuthResponse of(String accessToken, long expiresIn, String refreshToken, UserInfoDto user) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .expiresIn(expiresIn)
                .refreshToken(refreshToken)
                .user(user)
                .build();
    }

    public static AuthResponse tokenOnly(String accessToken, long expiresIn, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .expiresIn(expiresIn)
                .refreshToken(refreshToken)
                .build();
    }
}
