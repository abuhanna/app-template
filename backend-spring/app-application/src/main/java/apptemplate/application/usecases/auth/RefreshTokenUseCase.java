package apptemplate.application.usecases.auth;

import apptemplate.application.dto.auth.LoginResponse;
import apptemplate.application.dto.auth.RefreshTokenRequest;
import apptemplate.application.mappers.UserMapper;
import apptemplate.application.ports.repositories.RefreshTokenRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.application.ports.services.JwtTokenService;
import apptemplate.domain.entities.RefreshToken;
import apptemplate.domain.entities.User;
import apptemplate.domain.exceptions.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RefreshTokenUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenService jwtTokenService;
    private final CurrentUserService currentUserService;
    private final UserMapper userMapper;

    @Transactional
    public LoginResponse execute(RefreshTokenRequest request) {
        // Find and validate refresh token
        RefreshToken existingToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AuthenticationException("Invalid refresh token"));

        if (!existingToken.isActive()) {
            // Token reuse detected - revoke all tokens for this user
            refreshTokenRepository.revokeAllByUserId(existingToken.getUserId());
            throw new AuthenticationException("Invalid refresh token - possible token reuse detected");
        }

        if (existingToken.isExpired()) {
            throw new AuthenticationException("Refresh token has expired");
        }

        // Get user
        User user = userRepository.findById(existingToken.getUserId())
                .orElseThrow(() -> new AuthenticationException("User not found"));

        if (!user.isActive()) {
            throw new AuthenticationException("User account is disabled");
        }

        // Revoke old token (token rotation)
        String ipAddress = currentUserService.getClientIpAddress();
        existingToken.revoke(ipAddress);
        refreshTokenRepository.save(existingToken);

        // Generate new tokens
        String accessToken = jwtTokenService.generateToken(user);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .token(generateRefreshTokenValue())
                .userId(user.getId())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .createdByIp(ipAddress)
                .replacedByToken(null)
                .build();

        // Link old token to new one
        existingToken.setReplacedByToken(newRefreshToken.getToken());
        refreshTokenRepository.save(existingToken);
        refreshTokenRepository.save(newRefreshToken);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken.getToken())
                .expiresIn(jwtTokenService.getExpirationSeconds())
                .user(userMapper.toUserInfoResponse(user))
                .build();
    }

    private String generateRefreshTokenValue() {
        return java.util.UUID.randomUUID().toString().replace("-", "") +
               java.util.UUID.randomUUID().toString().replace("-", "");
    }
}
