package vn.hoidanit.springrestwithai.features.auth.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.hoidanit.springrestwithai.exception.RateLimitExceededException;
import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.config.AuthTokenProperties;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence.AuthToken;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence.AuthToken.TokenType;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence.AuthTokenRepository;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence.RefreshTokenRepository;
import vn.hoidanit.springrestwithai.features.notification.sms.SmsSender;
import vn.hoidanit.springrestwithai.features.users.application.UserService;
import vn.hoidanit.springrestwithai.features.users.infrastructure.persistence.UserRepository;
import vn.hoidanit.springrestwithai.model.User;

@Service
public class AuthTokenService {
    private static final Logger log = LoggerFactory.getLogger(AuthTokenService.class);

    private final SecureRandom secureRandom = new SecureRandom();

    private final AuthTokenRepository authTokenRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthTokenProperties properties;
    private final SmsSender smsSender;

    public AuthTokenService(
            AuthTokenRepository authTokenRepository,
            UserRepository userRepository,
            UserService userService,
            RefreshTokenRepository refreshTokenRepository,
            AuthTokenProperties properties,
            SmsSender smsSender) {
        this.authTokenRepository = authTokenRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.properties = properties;
        this.smsSender = smsSender;
    }

    @Transactional
    public void requestEmailVerification(String email, String ip, String userAgent) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            return;
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (user == null) {
            return;
        }
        if (user.isEmailVerified()) {
            return;
        }

        enforceRateLimit(normalizedEmail, TokenType.EMAIL_VERIFICATION,
                properties.getMaxEmailVerificationRequestsPerWindow());

        GeneratedToken token = createToken(user, normalizedEmail, TokenType.EMAIL_VERIFICATION,
                Instant.now().plus(properties.getEmailVerificationTtl()), ip, userAgent);

        String verifyUrl = properties.getVerifyEmailFrontendUrl().replaceAll("/+$", "")
                + "?token=" + token.rawToken();
        log.info("Email verification requested for {}. Verification URL: {}", normalizedEmail, verifyUrl);
    }

    @Transactional
    public void verifyEmail(String rawToken) {
        String tokenHash = sha256Hex(rawToken);
        AuthToken token = authTokenRepository.findByTokenHashAndType(tokenHash, TokenType.EMAIL_VERIFICATION)
                .orElseThrow(() -> new ResourceNotFoundException("Verification token", "token", "invalid"));

        if (token.isConsumed()) {
            throw new IllegalArgumentException("Token da duoc su dung");
        }
        if (token.isExpired()) {
            throw new IllegalArgumentException("Token da het han");
        }
        if (token.getUser() == null) {
            throw new IllegalArgumentException("Token khong hop le");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(Instant.now());
        userRepository.save(user);

        token.setConsumedAt(Instant.now());
        authTokenRepository.save(token);
    }

    @Transactional
    public void requestPasswordReset(String email, String ip, String userAgent) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            return;
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (user == null) {
            // Do not reveal whether email exists.
            return;
        }

        enforceRateLimit(normalizedEmail, TokenType.PASSWORD_RESET,
                properties.getMaxPasswordResetRequestsPerWindow());

        authTokenRepository.deleteByEmailAndType(normalizedEmail, TokenType.PASSWORD_RESET);

        GeneratedToken token = createToken(user, normalizedEmail, TokenType.PASSWORD_RESET,
                Instant.now().plus(properties.getPasswordResetTtl()), ip, userAgent);

        log.info("Password reset OTP requested for {}. OTP: {} (expires in {}s)",
                normalizedEmail, token.rawToken(), properties.getPasswordResetTtl().getSeconds());
    }

    @Transactional
    public void requestPasswordResetSms(String phone, String ip, String userAgent) {
        String normalizedPhone = normalizePhone(phone);
        if (normalizedPhone == null || normalizedPhone.isBlank()) {
            return;
        }

        User user = userRepository.findByPhone(normalizedPhone).orElse(null);
        if (user == null) {
            return;
        }

        enforceRateLimit(normalizedPhone, TokenType.PASSWORD_RESET,
                properties.getMaxPasswordResetRequestsPerWindow());

        authTokenRepository.deleteByEmailAndType(normalizedPhone, TokenType.PASSWORD_RESET);

        GeneratedToken token = createToken(user, normalizedPhone, TokenType.PASSWORD_RESET,
                Instant.now().plus(properties.getPasswordResetTtl()), ip, userAgent);

        String message = "OTP dat lai mat khau: " + token.rawToken() + " (het han sau "
                + properties.getPasswordResetTtl().getSeconds() + "s).";
        smsSender.send(normalizedPhone, message);
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedPhone = normalizePhone(email);
        String principal = (normalizedEmail != null && normalizedEmail.contains("@")) ? normalizedEmail : normalizedPhone;
        String tokenHash = sha256Hex(principal + ":" + otp);
        AuthToken token = authTokenRepository.findByTokenHashAndType(tokenHash, TokenType.PASSWORD_RESET)
                .orElseThrow(() -> new ResourceNotFoundException("Reset token", "token", "invalid"));

        if (token.isConsumed()) {
            throw new IllegalArgumentException("Token da duoc su dung");
        }
        if (token.isExpired()) {
            throw new IllegalArgumentException("Token da het han");
        }
        if (token.getUser() == null) {
            throw new IllegalArgumentException("Token khong hop le");
        }

        User user = token.getUser();
        userService.updatePassword(user, newPassword);
        refreshTokenRepository.deleteByUser(user);

        token.setConsumedAt(Instant.now());
        authTokenRepository.save(token);
    }

    private void enforceRateLimit(String normalizedEmail, TokenType type, int maxRequests) {
        Instant windowStart = Instant.now().minus(properties.getRateLimitWindow());
        long count = authTokenRepository.countByEmailAndTypeAndCreatedAtAfter(normalizedEmail, type, windowStart);
        if (count >= maxRequests) {
            throw new RateLimitExceededException("Ban da thao tac qua nhieu lan. Vui long thu lai sau.");
        }
    }

    private GeneratedToken createToken(User user, String normalizedEmail, TokenType type, Instant expiresAt,
            String ip, String userAgent) {
        String rawToken = type == TokenType.PASSWORD_RESET ? generateOtp6() : generateRawToken();

        AuthToken token = new AuthToken();
        token.setUser(user);
        token.setEmail(normalizedEmail);
        token.setType(type);
        String tokenHashMaterial = type == TokenType.PASSWORD_RESET ? normalizedEmail + ":" + rawToken : rawToken;
        token.setTokenHash(sha256Hex(tokenHashMaterial));
        token.setExpiresAt(expiresAt);
        token.setRequestedIp(trimToNull(ip));
        token.setRequestedUserAgent(trimToNull(userAgent));

        authTokenRepository.save(token);
        return new GeneratedToken(rawToken);
    }

    private String generateOtp6() {
        int value = secureRandom.nextInt(1_000_000);
        return String.format("%06d", value);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String value) {
        if (value == null) {
            return null;
        }
        return value.trim().replaceAll("\\s+", "");
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String sha256Hex(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("Token khong hop le");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return toHex(hashed);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not supported", ex);
        }
    }

    private String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(Character.forDigit((b >> 4) & 0xF, 16));
            sb.append(Character.forDigit(b & 0xF, 16));
        }
        return sb.toString();
    }

    public record GeneratedToken(String rawToken) {
    }
}
