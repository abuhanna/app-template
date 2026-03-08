package apptemplate.application.dto.auth;

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
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private UserInfoResponse user;

    public static LoginResponse of(String accessToken, long expiresIn, String refreshToken, UserInfoResponse user) {
        return LoginResponse.builder()
                .accessToken(accessToken)
                .expiresIn(expiresIn)
                .refreshToken(refreshToken)
                .user(user)
                .build();
    }

    /**
     * Creates a token-only response (for refresh token endpoint - no user object).
     */
    public static LoginResponse tokenOnly(String accessToken, long expiresIn, String refreshToken) {
        return LoginResponse.builder()
                .accessToken(accessToken)
                .expiresIn(expiresIn)
                .refreshToken(refreshToken)
                .build();
    }
}
