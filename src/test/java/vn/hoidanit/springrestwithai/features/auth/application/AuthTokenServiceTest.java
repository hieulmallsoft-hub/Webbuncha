package vn.hoidanit.springrestwithai.features.auth.application;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import vn.hoidanit.springrestwithai.exception.RateLimitExceededException;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.config.AuthTokenProperties;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence.AuthToken;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence.AuthToken.TokenType;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence.AuthTokenRepository;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence.RefreshTokenRepository;
import vn.hoidanit.springrestwithai.features.notification.sms.SmsSender;
import vn.hoidanit.springrestwithai.features.users.application.UserService;
import vn.hoidanit.springrestwithai.features.users.infrastructure.persistence.UserRepository;
import vn.hoidanit.springrestwithai.model.User;

@ExtendWith(MockitoExtension.class)
class AuthTokenServiceTest {

    @Mock
    private AuthTokenRepository authTokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private SmsSender smsSender;

    private AuthTokenProperties properties;

    private AuthTokenService authTokenService;

    @BeforeEach
    void setUp() {
        properties = new AuthTokenProperties();
        properties.setRateLimitWindow(Duration.ofMinutes(15));
        properties.setMaxPasswordResetRequestsPerWindow(2);
        properties.setMaxEmailVerificationRequestsPerWindow(2);
        properties.setEmailVerificationTtl(Duration.ofHours(24));
        properties.setPasswordResetTtl(Duration.ofMinutes(15));
        properties.setPublicBaseUrl("http://localhost:8080");
        properties.setPasswordResetFrontendUrl("http://localhost:5173/reset-password");

        authTokenService = new AuthTokenService(authTokenRepository, userRepository, userService, refreshTokenRepository,
                properties, smsSender);
    }

    @Test
    void requestPasswordReset_doesNotRevealMissingEmail() {
        when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> authTokenService.requestPasswordReset("missing@example.com", "127.0.0.1", "ua"));

        verify(authTokenRepository, never()).save(any(AuthToken.class));
    }

    @Test
    void requestPasswordReset_enforcesRateLimit() {
        User user = new User();
        user.setEmail("a@example.com");
        when(userRepository.findByEmailIgnoreCase("a@example.com")).thenReturn(Optional.of(user));
        when(authTokenRepository.countByEmailAndTypeAndCreatedAtAfter(eq("a@example.com"), eq(TokenType.PASSWORD_RESET),
                any(Instant.class))).thenReturn(2L);

        assertThrows(RateLimitExceededException.class,
                () -> authTokenService.requestPasswordReset("a@example.com", "127.0.0.1", "ua"));
    }

    @Test
    void resetPassword_consumesTokenAndUpdatesPassword() {
        User user = new User();
        user.setEmail("a@example.com");

        AuthToken token = new AuthToken();
        token.setUser(user);
        token.setEmail("a@example.com");
        token.setType(TokenType.PASSWORD_RESET);
        token.setExpiresAt(Instant.now().plusSeconds(60));

        when(authTokenRepository.findByTokenHashAndType(any(String.class), eq(TokenType.PASSWORD_RESET)))
                .thenReturn(Optional.of(token));

        authTokenService.resetPassword("a@example.com", "123456", "new-password-123");

        verify(userService).updatePassword(user, "new-password-123");
        verify(refreshTokenRepository).deleteByUser(user);
        verify(authTokenRepository).save(token);
    }
}
