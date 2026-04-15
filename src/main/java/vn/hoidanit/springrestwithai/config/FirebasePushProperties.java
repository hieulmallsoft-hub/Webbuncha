package vn.hoidanit.springrestwithai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.push.firebase")
public class FirebasePushProperties {

    private boolean enabled;

    private String serviceAccountLocation;

    private String projectId;

    private String apiKey;

    private String authDomain;

    private String storageBucket;

    private String messagingSenderId;

    private String appId;

    private String vapidKey;

    private String adminOrdersPath = "/admin/orders";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getServiceAccountLocation() {
        return serviceAccountLocation;
    }

    public void setServiceAccountLocation(String serviceAccountLocation) {
        this.serviceAccountLocation = serviceAccountLocation;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getAuthDomain() {
        return authDomain;
    }

    public void setAuthDomain(String authDomain) {
        this.authDomain = authDomain;
    }

    public String getStorageBucket() {
        return storageBucket;
    }

    public void setStorageBucket(String storageBucket) {
        this.storageBucket = storageBucket;
    }

    public String getMessagingSenderId() {
        return messagingSenderId;
    }

    public void setMessagingSenderId(String messagingSenderId) {
        this.messagingSenderId = messagingSenderId;
    }

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String getVapidKey() {
        return vapidKey;
    }

    public void setVapidKey(String vapidKey) {
        this.vapidKey = vapidKey;
    }

    public String getAdminOrdersPath() {
        return adminOrdersPath;
    }

    public void setAdminOrdersPath(String adminOrdersPath) {
        this.adminOrdersPath = adminOrdersPath;
    }

    public boolean isWebConfigComplete() {
        return hasText(apiKey)
                && hasText(authDomain)
                && hasText(projectId)
                && hasText(messagingSenderId)
                && hasText(appId)
                && hasText(vapidKey);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
