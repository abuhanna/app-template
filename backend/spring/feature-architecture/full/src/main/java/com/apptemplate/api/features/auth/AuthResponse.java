package com.apptemplate.api.features.auth;

import com.apptemplate.api.features.users.User;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private UserDto user;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserDto {
        private Long id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String role;
        private Long departmentId;
        private String departmentName;
        @JsonProperty("isActive")
        private boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime lastLoginAt;

        public static UserDto fromEntity(User user) {
            return UserDto.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .fullName(user.getFullName())
                    .role(user.getRole())
                    .departmentId(user.getDepartmentId())
                    .departmentName(user.getDepartmentName())
                    .isActive(user.isActive())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .lastLoginAt(user.getLastLoginAt())
                    .build();
        }
    }
}
