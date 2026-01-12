package apptemplate.application.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String tokenType;
    private long expiresIn;
    private String refreshToken;
    private LocalDateTime refreshTokenExpiresAt;
    private UserInfoResponse user;

    public static LoginResponse of(String token, long expiresIn, String refreshToken,
                                   LocalDateTime refreshTokenExpiresAt, UserInfoResponse user) {
        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .refreshToken(refreshToken)
                .refreshTokenExpiresAt(refreshTokenExpiresAt)
                .user(user)
                .build();
    }
}
