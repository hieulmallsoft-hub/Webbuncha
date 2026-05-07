package vn.hoidanit.springrestwithai.features.chatbot.presentation;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.hoidanit.springrestwithai.features.chatbot.application.ChatbotService;
import vn.hoidanit.springrestwithai.features.chatbot.presentation.dto.request.ChatRequest;
import vn.hoidanit.springrestwithai.features.chatbot.presentation.dto.response.ChatResponse;
import vn.hoidanit.springrestwithai.helper.ApiResponse;

@RestController
@RequestMapping("/chat")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@Valid @RequestBody ChatRequest request,
            Authentication authentication) {
        String userEmail = authentication != null && authentication.isAuthenticated()
                ? authentication.getName()
                : null;
        ChatResponse response = new ChatResponse(chatbotService.reply(request.getMessage(), userEmail));
        return ResponseEntity.ok(ApiResponse.success("Chat reply success", response));
    }
}
