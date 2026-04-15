package vn.hoidanit.springrestwithai.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PushTokenRequest {

    @NotBlank(message = "Token khong duoc de trong")
    private String token;

    @Size(max = 30, message = "Platform toi da 30 ky tu")
    private String platform;

    @Size(max = 1000, message = "User agent toi da 1000 ky tu")
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
