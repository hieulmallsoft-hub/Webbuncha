package vn.hoidanit.springrestwithai.features.chatbot.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {

    private String provider = "openai";
    private String apiKey = "";
    private String model = "gpt-5-mini";
    private String baseUrl = "https://api.openai.com/v1";

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public boolean isOpenAiConfigured() {
        return "openai".equalsIgnoreCase(provider) && apiKey != null && !apiKey.isBlank();
    }
}
