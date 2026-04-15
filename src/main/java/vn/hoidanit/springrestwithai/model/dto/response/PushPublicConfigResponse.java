package vn.hoidanit.springrestwithai.model.dto.response;

import java.util.Map;

import vn.hoidanit.springrestwithai.config.FirebasePushProperties;

public class PushPublicConfigResponse {

    private final boolean enabled;

    private final String vapidKey;

    private final Map<String, String> firebaseConfig;

    public PushPublicConfigResponse(boolean enabled, String vapidKey, Map<String, String> firebaseConfig) {
        this.enabled = enabled;
        this.vapidKey = vapidKey;
        this.firebaseConfig = firebaseConfig;
    }

    public static PushPublicConfigResponse from(FirebasePushProperties properties) {
        boolean enabled = properties.isEnabled() && properties.isWebConfigComplete();
        if (!enabled) {
            return new PushPublicConfigResponse(false, null, null);
        }

        return new PushPublicConfigResponse(
                true,
                properties.getVapidKey(),
                Map.of(
                        "apiKey", properties.getApiKey(),
                        "authDomain", properties.getAuthDomain(),
                        "projectId", properties.getProjectId(),
                        "storageBucket", defaultString(properties.getStorageBucket()),
                        "messagingSenderId", properties.getMessagingSenderId(),
                        "appId", properties.getAppId()));
    }

    private static String defaultString(String value) {
        return value == null ? "" : value;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String getVapidKey() {
        return vapidKey;
    }

    public Map<String, String> getFirebaseConfig() {
        return firebaseConfig;
    }
}
