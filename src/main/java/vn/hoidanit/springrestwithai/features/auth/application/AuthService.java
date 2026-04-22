package vn.hoidanit.springrestwithai.features.auth.application;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence.RefreshToken;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.persistence.RefreshTokenRepository;
import vn.hoidanit.springrestwithai.features.auth.infrastructure.config.AuthTokenProperties;
import vn.hoidanit.springrestwithai.features.auth.presentation.dto.request.RegisterRequest;
import vn.hoidanit.springrestwithai.features.auth.presentation.dto.response.RegisterResponse;
import vn.hoidanit.springrestwithai.features.auth.presentation.dto.response.TokenResponse;
import vn.hoidanit.springrestwithai.exception.DuplicateResourceException;
import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.features.users.application.UserService;
import vn.hoidanit.springrestwithai.features.users.infrastructure.persistence.UserRepository;

@Service
public class AuthService {
    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthTokenProperties authTokenProperties;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refreshExpiration:604800000}")
    private long refreshExpiration;

    public AuthService(
            UserService userService,
            UserRepository userRepository,
            JwtService jwtService,
            RefreshTokenRepository refreshTokenRepository,
            AuthTokenProperties authTokenProperties
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.authTokenProperties = authTokenProperties;
    }

    public RegisterResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        boolean emailExists = userRepository.existsByEmailIgnoreCase(normalizedEmail);
        if (emailExists) {
            throw new DuplicateResourceException("Nguoi dung", "email", normalizedEmail);
        }
        String normalizedPhone = normalizePhone(request.getPhone());
        if (normalizedPhone != null && !normalizedPhone.isBlank() && userRepository.existsByPhone(normalizedPhone)) {
            throw new DuplicateResourceException("Nguoi dung", "phone", normalizedPhone);
        }
        var user = request.toUser();
        user.setEmail(normalizedEmail);
        user.setPhone(normalizedPhone);
        if (user.getAge() == null) {
            user.setAge(18);
        }
        if (user.getAddress() == null) {
            user.setAddress("");
        }
        user = this.userService.createUser(user);
        return new RegisterResponse(user.getId(), user.getEmail(), user.getName());
    }

    @Transactional
    public TokenResponse login(String email) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Nguoi dung", "email", email));

        if (authTokenProperties.isRequireVerifiedEmailForLogin() && !user.isEmailVerified()) {
            throw new IllegalArgumentException("Vui long xac thuc email truoc khi dang nhap");
        }

        refreshTokenRepository.deleteByUser(user);

        String role = user.getRole() != null ? user.getRole().name() : "USER";
        String accessToken = jwtService.generateToken(user.getEmail(), List.of("ROLE_" + role));
        RefreshToken refreshToken = createRefreshToken(user);
        return new TokenResponse(accessToken, "Bearer", jwtExpiration, refreshToken.getToken(), refreshExpiration);
    }

    @Transactional
    public TokenResponse refreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token", "token", token));

        if (refreshToken.isRevoked()) {
            throw new ResourceNotFoundException("Refresh token", "token", token);
        }

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new ResourceNotFoundException("Refresh token", "token", token);
        }

        User user = refreshToken.getUser();
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        String role = user.getRole() != null ? user.getRole().name() : "USER";
        String accessToken = jwtService.generateToken(user.getEmail(), List.of("ROLE_" + role));
        RefreshToken newToken = createRefreshToken(user);
        return new TokenResponse(accessToken, "Bearer", jwtExpiration, newToken.getToken(), refreshExpiration);
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpiration));
        refreshToken.setRevoked(false);
        return refreshTokenRepository.save(refreshToken);
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
}
