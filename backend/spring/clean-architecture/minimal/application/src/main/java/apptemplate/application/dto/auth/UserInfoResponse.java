package apptemplate.application.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User info response built from JWT claims.
 * In minimal variant, there is no users table -- all user info comes from JWT claims.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {

    private String userId;
    private String username;
    private String email;
    private String role;
}
