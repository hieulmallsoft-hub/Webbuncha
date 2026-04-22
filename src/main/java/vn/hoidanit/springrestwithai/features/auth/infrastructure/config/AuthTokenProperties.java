package vn.hoidanit.springrestwithai.features.auth.infrastructure.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Component
@Validated
@ConfigurationProperties(prefix = "app.auth")
public class AuthTokenProperties {

    private Duration emailVerificationTtl = Duration.ofHours(24);
    private Duration passwordResetTtl = Duration.ofMinutes(15);

    private Duration rateLimitWindow = Duration.ofMinutes(15);

    @Min(1)
    private int maxEmailVerificationRequestsPerWindow = 5;

    @Min(1)
    private int maxPasswordResetRequestsPerWindow = 5;

    @NotBlank
    private String publicBaseUrl = "http://localhost:8080";

    @NotBlank
    private String passwordResetFrontendUrl = "http://localhost:5173/reset-password";

    @NotBlank
    private String verifyEmailFrontendUrl = "http://localhost:5173/verify-email";

    private boolean requireVerifiedEmailForLogin = false;

    public Duration getEmailVerificationTtl() {
        return emailVerificationTtl;
    }

    public void setEmailVerificationTtl(Duration emailVerificationTtl) {
        this.emailVerificationTtl = emailVerificationTtl;
    }

    public Duration getPasswordResetTtl() {
        return passwordResetTtl;
    }

    public void setPasswordResetTtl(Duration passwordResetTtl) {
        this.passwordResetTtl = passwordResetTtl;
    }

    public Duration getRateLimitWindow() {
        return rateLimitWindow;
    }

    public void setRateLimitWindow(Duration rateLimitWindow) {
        this.rateLimitWindow = rateLimitWindow;
    }

    public int getMaxEmailVerificationRequestsPerWindow() {
        return maxEmailVerificationRequestsPerWindow;
    }

    public void setMaxEmailVerificationRequestsPerWindow(int maxEmailVerificationRequestsPerWindow) {
        this.maxEmailVerificationRequestsPerWindow = maxEmailVerificationRequestsPerWindow;
    }

    public int getMaxPasswordResetRequestsPerWindow() {
        return maxPasswordResetRequestsPerWindow;
    }

    public void setMaxPasswordResetRequestsPerWindow(int maxPasswordResetRequestsPerWindow) {
        this.maxPasswordResetRequestsPerWindow = maxPasswordResetRequestsPerWindow;
    }

    public String getPublicBaseUrl() {
        return publicBaseUrl;
    }

    public void setPublicBaseUrl(String publicBaseUrl) {
        this.publicBaseUrl = publicBaseUrl;
    }

    public String getPasswordResetFrontendUrl() {
        return passwordResetFrontendUrl;
    }

    public void setPasswordResetFrontendUrl(String passwordResetFrontendUrl) {
        this.passwordResetFrontendUrl = passwordResetFrontendUrl;
    }

    public String getVerifyEmailFrontendUrl() {
        return verifyEmailFrontendUrl;
    }

    public void setVerifyEmailFrontendUrl(String verifyEmailFrontendUrl) {
        this.verifyEmailFrontendUrl = verifyEmailFrontendUrl;
    }

    public boolean isRequireVerifiedEmailForLogin() {
        return requireVerifiedEmailForLogin;
    }

    public void setRequireVerifiedEmailForLogin(boolean requireVerifiedEmailForLogin) {
        this.requireVerifiedEmailForLogin = requireVerifiedEmailForLogin;
    }
}
