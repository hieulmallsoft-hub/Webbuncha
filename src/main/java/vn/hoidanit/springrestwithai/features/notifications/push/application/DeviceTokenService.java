package vn.hoidanit.springrestwithai.features.notifications.push.application;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Locale;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.features.notifications.push.infrastructure.persistence.DeviceToken;
import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.features.notifications.push.infrastructure.persistence.DeviceTokenRepository;
import vn.hoidanit.springrestwithai.features.notifications.push.presentation.dto.request.PushTokenRequest;
import vn.hoidanit.springrestwithai.features.users.infrastructure.persistence.UserRepository;

@Service
public class DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;

    public DeviceTokenService(DeviceTokenRepository deviceTokenRepository, UserRepository userRepository) {
        this.deviceTokenRepository = deviceTokenRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void registerAdminToken(String email, PushTokenRequest request) {
        User user = getRequiredAdmin(email);
        String tokenValue = normalizeToken(request.getToken());

        DeviceToken deviceToken = deviceTokenRepository.findByToken(tokenValue)
                .orElseGet(DeviceToken::new);
        deviceToken.setUser(user);
        deviceToken.setToken(tokenValue);
        deviceToken.setPlatform(normalizePlatform(request.getPlatform()));
        deviceToken.setUserAgent(trimToNull(request.getUserAgent()));
        deviceToken.setEnabled(Boolean.TRUE);
        deviceToken.setLastSeenAt(Instant.now());
        deviceTokenRepository.save(deviceToken);
    }

    @Transactional
    public void unregisterAdminToken(String email, String token) {
        String tokenValue = normalizeToken(token);
        if (tokenValue == null) {
            return;
        }
        deviceTokenRepository.deleteByTokenAndUser_Email(tokenValue, email);
    }

    public List<String> getActiveAdminTokens() {
        return deviceTokenRepository.findAllByUser_RoleAndEnabledTrue(User.RoleEnum.ADMIN).stream()
                .map(DeviceToken::getToken)
                .filter(value -> value != null && !value.isBlank())
                .distinct()
                .toList();
    }

    @Transactional
    public void deleteTokens(Collection<String> tokens) {
        if (tokens == null || tokens.isEmpty()) {
            return;
        }
        List<String> values = tokens.stream()
                .map(this::normalizeToken)
                .filter(value -> value != null && !value.isBlank())
                .distinct()
                .toList();
        if (!values.isEmpty()) {
            deviceTokenRepository.deleteAllByTokenIn(values);
        }
    }

    private User getRequiredAdmin(String email) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("Nguoi dung", "email", email));
        if (user.getRole() != User.RoleEnum.ADMIN) {
            throw new AccessDeniedException("Khong co quyen dang ky thiet bi nhan thong bao");
        }
        return user;
    }

    private String normalizePlatform(String platform) {
        String value = trimToNull(platform);
        return value == null ? "ANDROID_WEB" : value.toUpperCase();
    }

    private String normalizeToken(String token) {
        return trimToNull(token);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
