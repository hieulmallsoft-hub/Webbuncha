package vn.hoidanit.springrestwithai.features.notifications.push.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PushTokenRequest {

    @NotBlank(message = "Token must not be blank")
    private String token;

    @Size(max = 30, message = "Platform must be at most 30 characters")
    private String platform;

    @Size(max = 1000, message = "User agent must be at most 1000 characters")
    private String userAgent;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
}

