package vn.hoidanit.springrestwithai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import vn.hoidanit.springrestwithai.exception.DuplicateResourceException;
import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.model.RefreshToken;
import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.model.dto.request.RegisterRequest;
import vn.hoidanit.springrestwithai.model.dto.response.RegisterRespone;
import vn.hoidanit.springrestwithai.model.dto.response.TokenResponse;
import vn.hoidanit.springrestwithai.repository.RefreshTokenRepository;
import vn.hoidanit.springrestwithai.repository.UserRepository;

@Service
public class AuthService {
    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refreshExpiration:604800000}")
    private long refreshExpiration;

    public AuthService(
            UserService userService,
            UserRepository userRepository,
            JwtService jwtService,
            RefreshTokenRepository refreshTokenRepository
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public RegisterRespone register(RegisterRequest request) {
        boolean emailExists = userRepository.existsByEmail(request.getEmail());
        if (emailExists) {
            throw new DuplicateResourceException("Nguoi dung", "email", request.getEmail());
        }
        var user = request.toUser();
        if (user.getAge() == null) {
            user.setAge(18);
        }
        if (user.getAddress() == null) {
            user.setAddress("");
        }
        user = this.userService.createUser(user);
        return new RegisterRespone(user.getId(), user.getEmail(), user.getName());
    }

    @Transactional
    public TokenResponse login(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Nguoi dung", "email", email));

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
}
