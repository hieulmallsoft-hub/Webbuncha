package vn.hoidanit.springrestwithai.features.chatbot.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChatRequest {

    @NotBlank(message = "Message is required")
    @Size(max = 1000, message = "Message must be at most 1000 characters")
    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
