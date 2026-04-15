package vn.hoidanit.springrestwithai.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.MulticastMessage;
import com.google.firebase.messaging.SendResponse;

import vn.hoidanit.springrestwithai.config.FirebasePushProperties;
import vn.hoidanit.springrestwithai.model.Order;

@Service
public class PushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);
    private static final String ORDER_CREATED_TYPE = "ORDER_CREATED";
    private static final String ORDER_TITLE = "\u0110\u01A1n h\u00E0ng m\u1EDBi";

    private final Optional<FirebaseMessaging> firebaseMessaging;
    private final DeviceTokenService deviceTokenService;
    private final FirebasePushProperties pushProperties;

    public PushNotificationService(Optional<FirebaseMessaging> firebaseMessaging,
            DeviceTokenService deviceTokenService,
            FirebasePushProperties pushProperties) {
        this.firebaseMessaging = firebaseMessaging;
        this.deviceTokenService = deviceTokenService;
        this.pushProperties = pushProperties;
    }

    public void sendOrderCreatedNotification(Order order) {
        if (!pushProperties.isEnabled()) {
            return;
        }

        FirebaseMessaging messaging = firebaseMessaging.orElse(null);
        if (messaging == null) {
            log.warn("FCM is enabled but FirebaseMessaging is not available");
            return;
        }

        List<String> tokens = deviceTokenService.getActiveAdminTokens();
        if (tokens.isEmpty()) {
            return;
        }

        MulticastMessage message = MulticastMessage.builder()
                .addAllTokens(tokens)
                .putData("type", ORDER_CREATED_TYPE)
                .putData("title", ORDER_TITLE)
                .putData("body", buildOrderBody(order))
                .putData("url", resolveOrdersPath())
                .putData("orderId", order.getId() == null ? "" : String.valueOf(order.getId()))
                .build();

        try {
            BatchResponse response = messaging.sendEachForMulticast(message);
            pruneUnregisteredTokens(tokens, response);
            if (response.getFailureCount() > 0) {
                log.warn("FCM push for order {} finished with {} failures", order.getId(), response.getFailureCount());
            }
        } catch (FirebaseMessagingException ex) {
            log.error("Failed to send FCM push for order {}", order.getId(), ex);
        }
    }

    private void pruneUnregisteredTokens(List<String> tokens, BatchResponse response) {
        List<String> invalidTokens = new ArrayList<>();
        List<SendResponse> responses = response.getResponses();
        for (int i = 0; i < responses.size() && i < tokens.size(); i++) {
            SendResponse sendResponse = responses.get(i);
            if (sendResponse.isSuccessful()) {
                continue;
            }

            FirebaseMessagingException exception = sendResponse.getException();
            if (exception != null && exception.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                invalidTokens.add(tokens.get(i));
            }
        }

        if (!invalidTokens.isEmpty()) {
            deviceTokenService.deleteTokens(invalidTokens);
        }
    }

    private String buildOrderBody(Order order) {
        StringBuilder builder = new StringBuilder("Don #");
        if (order.getId() != null) {
            builder.append(order.getId());
        }

        if (order.getOrderType() != null) {
            builder.append(" - ").append(order.getOrderType().name());
        }

        String customerName = firstNonBlank(
                order.getReceiverName(),
                order.getUser() != null ? order.getUser().getName() : null);
        if (customerName != null) {
            builder.append(" - ").append(customerName);
        }

        return builder.toString();
    }

    private String resolveOrdersPath() {
        String path = pushProperties.getAdminOrdersPath();
        return (path == null || path.isBlank()) ? "/admin/orders" : path;
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
