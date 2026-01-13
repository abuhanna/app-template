package apptemplate.application.usecases.auth;

import apptemplate.application.dto.auth.LoginRequest;
import apptemplate.application.dto.auth.LoginResponse;
import apptemplate.application.mappers.UserMapper;
import apptemplate.application.ports.repositories.RefreshTokenRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.application.ports.services.JwtTokenService;
import apptemplate.application.ports.services.PasswordService;
import apptemplate.domain.entities.RefreshToken;
import apptemplate.domain.entities.User;
import apptemplate.domain.exceptions.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LoginUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordService passwordService;
    private final JwtTokenService jwtTokenService;
    private final CurrentUserService currentUserService;
    private final UserMapper userMapper;

    @Transactional
    public LoginResponse execute(LoginRequest request) {
        // Find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthenticationException("Invalid username or password"));

        // Verify password
        if (!passwordService.verifyPassword(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid username or password");
        }

        // Check if user is active
        if (!user.isActive()) {
            throw new AuthenticationException("User account is disabled");
        }

        // Record login
        String ipAddress = currentUserService.getClientIpAddress();
        user.recordLogin(ipAddress);
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtTokenService.generateToken(user);

        // Create and save refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .token(generateRefreshTokenValue())
                .userId(user.getId())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .createdByIp(ipAddress)
                .build();
        refreshTokenRepository.save(refreshToken);

        return LoginResponse.builder()
                .token(accessToken)
                .tokenType("Bearer")
                .refreshToken(refreshToken.getToken())
                .refreshTokenExpiresAt(refreshToken.getExpiresAt())
                .expiresIn(jwtTokenService.getExpirationSeconds())
                .user(userMapper.toUserInfoResponse(user))
                .build();
    }

    private String generateRefreshTokenValue() {
        return java.util.UUID.randomUUID().toString().replace("-", "") +
               java.util.UUID.randomUUID().toString().replace("-", "");
    }
}
