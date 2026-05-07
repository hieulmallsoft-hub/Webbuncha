package vn.hoidanit.springrestwithai.features.chatbot.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import vn.hoidanit.springrestwithai.features.catalog.products.application.ProductService;
import vn.hoidanit.springrestwithai.features.chatbot.infrastructure.openai.OpenAiChatClient;
import vn.hoidanit.springrestwithai.features.orders.application.OrderService;
import vn.hoidanit.springrestwithai.model.dto.response.ProductResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChatbotService")
class ChatbotServiceTest {

    @Mock
    private ProductService productService;

    @Mock
    private StoreStatusService storeStatusService;

    @Mock
    private OpenAiChatClient openAiChatClient;

    @Mock
    private OrderService orderService;

    @InjectMocks
    private ChatbotService chatbotService;

    @Test
    @DisplayName("Uses OpenAI reply with menu and store context")
    void usesOpenAiReplyWithStoreContext() {
        ProductResponse bunCha = product("Bún chả", "45000", "Thịt nướng than hoa");
        when(productService.getProductResponses(null)).thenReturn(List.of(bunCha));
        when(storeStatusService.isOpenNow()).thenReturn(true);
        when(storeStatusService.getHoursText()).thenReturn("08:00 - 22:00");
        when(storeStatusService.getAddress()).thenReturn("Số 8 Trần Phú, Phường Bỉm Sơn");
        when(openAiChatClient.complete(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.eq("Còn bún chả không?")))
                .thenReturn(Optional.of("Bún chả đang có trong menu, giá 45000đ."));

        String reply = chatbotService.reply("Còn bún chả không?");

        assertEquals("Bún chả đang có trong menu, giá 45000đ.", reply);

        ArgumentCaptor<String> instructionsCaptor = ArgumentCaptor.forClass(String.class);
        verify(openAiChatClient).complete(instructionsCaptor.capture(), org.mockito.ArgumentMatchers.eq("Còn bún chả không?"));
        String instructions = instructionsCaptor.getValue();
        assertTrue(instructions.contains("Bún chả"));
        assertTrue(instructions.contains("45000đ"));
        assertTrue(instructions.contains("08:00 - 22:00"));
        assertTrue(instructions.contains("Số 8 Trần Phú"));
    }

    @Test
    @DisplayName("Falls back to deterministic product answer when OpenAI is unavailable")
    void fallsBackWhenOpenAiUnavailable() {
        ProductResponse bunCha = product("Bún chả", "45000", null);
        when(productService.getProductResponses(null)).thenReturn(List.of(bunCha));
        when(storeStatusService.isOpenNow()).thenReturn(true);
        when(storeStatusService.getHoursText()).thenReturn("08:00 - 22:00");
        when(storeStatusService.getAddress()).thenReturn("Số 8 Trần Phú, Phường Bỉm Sơn");
        when(openAiChatClient.complete(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn(Optional.empty());

        String reply = chatbotService.reply("Còn bún chả không?");

        assertTrue(reply.contains("Bún chả đang có trong menu"));
        assertTrue(reply.contains("45000đ"));
    }

    @Test
    @DisplayName("Falls back to store address answer")
    void fallsBackToStoreAddress() {
        when(productService.getProductResponses(null)).thenReturn(List.of());
        when(storeStatusService.isOpenNow()).thenReturn(true);
        when(storeStatusService.getHoursText()).thenReturn("08:00 - 22:00");
        when(storeStatusService.getAddress()).thenReturn("Số 8 Trần Phú, Phường Bỉm Sơn");
        when(openAiChatClient.complete(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn(Optional.empty());

        String reply = chatbotService.reply("địa chỉ quán");

        assertEquals("Địa chỉ quán: Số 8 Trần Phú, Phường Bỉm Sơn.", reply);
    }

    private ProductResponse product(String name, String price, String description) {
        ProductResponse product = new ProductResponse();
        product.setName(name);
        product.setPrice(new BigDecimal(price));
        product.setDescription(description);
        return product;
    }
}
