package vn.hoidanit.springrestwithai.features.chatbot.infrastructure.openai;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.databind.JsonNode;

import vn.hoidanit.springrestwithai.features.chatbot.infrastructure.config.AiProperties;

@Service
public class OpenAiChatClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiChatClient.class);

    private final AiProperties properties;
    private final RestClient.Builder restClientBuilder;

    public OpenAiChatClient(AiProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClientBuilder = restClientBuilder;
    }

    public Optional<String> complete(String instructions, String input) {
        if (!properties.isOpenAiConfigured()) {
            log.warn("OpenAI is not configured; chatbot will use fallback");
            return Optional.empty();
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("model", properties.getModel());
        payload.put("instructions", instructions);
        payload.put("input", input);
        payload.put("store", false);

        try {
            JsonNode response = restClient()
                    .post()
                    .uri("/responses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(JsonNode.class);

            return extractText(response);
        } catch (RestClientException ex) {
            log.warn("OpenAI request failed: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private RestClient restClient() {
        return restClientBuilder
                .clone()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("Authorization", "Bearer " + properties.getApiKey())
                .build();
    }

    private Optional<String> extractText(JsonNode response) {
        if (response == null) {
            return Optional.empty();
        }

        JsonNode outputText = response.get("output_text");
        if (outputText != null && outputText.isTextual() && !outputText.asText().isBlank()) {
            return Optional.of(outputText.asText().trim());
        }

        JsonNode output = response.get("output");
        if (output == null || !output.isArray()) {
            return Optional.empty();
        }

        StringBuilder text = new StringBuilder();
        for (JsonNode item : output) {
            JsonNode content = item.get("content");
            if (content == null || !content.isArray()) {
                continue;
            }
            for (JsonNode contentItem : content) {
                JsonNode contentText = contentItem.get("text");
                if (contentText != null && contentText.isTextual()) {
                    text.append(contentText.asText()).append('\n');
                }
            }
        }

        String result = text.toString().trim();
        return result.isBlank() ? Optional.empty() : Optional.of(result);
    }
}
