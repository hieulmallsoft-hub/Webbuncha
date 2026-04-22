package vn.hoidanit.springrestwithai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.features.users.application.UserService;
import vn.hoidanit.springrestwithai.features.users.infrastructure.persistence.UserRepository;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.enabled:false}")
    private boolean adminEnabled;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Value("${app.admin.name:Admin}")
    private String adminName;

    public AdminSeeder(UserRepository userRepository, UserService userService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!adminEnabled) {
            return;
        }
        if (adminEmail == null || adminEmail.isBlank()) {
            return;
        }
        if (adminPassword == null || adminPassword.isBlank()) {
            return;
        }
        String normalizedAdminEmail = normalizeEmail(adminEmail);
        User existing = userRepository.findByEmailIgnoreCase(normalizedAdminEmail).orElse(null);
        if (existing != null) {
            boolean needsUpdate = false;
            if (adminName != null && !adminName.isBlank() && !adminName.equals(existing.getName())) {
                existing.setName(adminName);
                needsUpdate = true;
            }
            if (existing.getRole() != User.RoleEnum.ADMIN) {
                existing.setRole(User.RoleEnum.ADMIN);
                needsUpdate = true;
            }
            if (existing.getPassword() == null || !passwordEncoder.matches(adminPassword, existing.getPassword())) {
                existing.setPassword(passwordEncoder.encode(adminPassword));
                needsUpdate = true;
            }
            if (needsUpdate) {
                userRepository.save(existing);
            }
            return;
        }

        User admin = new User();
        admin.setEmail(normalizedAdminEmail);
        admin.setName(adminName);
        admin.setPassword(adminPassword);
        admin.setRole(User.RoleEnum.ADMIN);
        admin.setEmailVerified(true);
        admin.setEmailVerifiedAt(java.time.Instant.now());
        userService.createUser(admin);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
