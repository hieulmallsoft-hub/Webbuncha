package vn.hoidanit.springrestwithai.features.chatbot.application;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import vn.hoidanit.springrestwithai.features.catalog.products.application.ProductService;
import vn.hoidanit.springrestwithai.features.chatbot.infrastructure.openai.OpenAiChatClient;
import vn.hoidanit.springrestwithai.features.orders.application.OrderService;
import vn.hoidanit.springrestwithai.model.Order;
import vn.hoidanit.springrestwithai.model.dto.response.ProductResponse;

@Service
public class ChatbotService {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}");
    private static final Set<String> GENERIC_TOKENS = Set.of(
            "ban", "mon", "quan", "ngon", "goi", "cho", "toi", "xin", "biet", "co", "khong", "may", "gio");

    private final ProductService productService;
    private final StoreStatusService storeStatusService;
    private final OpenAiChatClient openAiChatClient;
    private final OrderService orderService;

    public ChatbotService(ProductService productService, StoreStatusService storeStatusService,
            OpenAiChatClient openAiChatClient, OrderService orderService) {
        this.productService = productService;
        this.storeStatusService = storeStatusService;
        this.openAiChatClient = openAiChatClient;
        this.orderService = orderService;
    }

    public String reply(String message) {
        return reply(message, null);
    }

    public String reply(String message, String userEmail) {
        List<ProductResponse> products = productService.getProductResponses(null);
        List<Order> recentOrders = getRecentOrders(userEmail);

        return openAiChatClient.complete(buildInstructions(products, recentOrders, userEmail), message)
                .orElseGet(() -> fallbackReply(message, products, recentOrders, userEmail));
    }

    private String buildInstructions(List<ProductResponse> products, List<Order> recentOrders, String userEmail) {
        return """
                B\u1ea1n l\u00e0 chatbot hybrid c\u1ee7a website B\u00fan Ch\u1ea3 Chinh H\u01b0\u01a1ng.
                Tr\u1ea3 l\u1eddi b\u1eb1ng ti\u1ebfng Vi\u1ec7t t\u1ef1 nhi\u00ean, ng\u1eafn g\u1ecdn, th\u00e2n thi\u1ec7n.
                N\u1ebfu c\u00e2u h\u1ecfi li\u00ean quan \u0111\u1ebfn qu\u00e1n, menu, gi\u00e1, gi\u1edd m\u1edf c\u1eeda, \u0111\u1ecba ch\u1ec9, c\u00e1ch \u0111\u1eb7t h\u00e0ng ho\u1eb7c \u0111\u01a1n h\u00e0ng, b\u1eaft bu\u1ed9c d\u00f9ng d\u1eef li\u1ec7u h\u1ec7 th\u1ed1ng trong ng\u1eef c\u1ea3nh.
                N\u1ebfu c\u00e2u h\u1ecfi kh\u00f4ng li\u00ean quan \u0111\u1ebfn qu\u00e1n, h\u00e3y tr\u1ea3 l\u1eddi nh\u01b0 m\u1ed9t tr\u1ee3 l\u00fd AI th\u00f4ng th\u01b0\u1eddng, mi\u1ec5n l\u00e0 an to\u00e0n v\u00e0 h\u1eefu \u00edch.
                Kh\u00f4ng b\u1ecba th\u00f4ng tin v\u1ec1 qu\u00e1n, menu, gi\u00e1, \u0111\u1ecba ch\u1ec9 ho\u1eb7c \u0111\u01a1n h\u00e0ng ngo\u00e0i d\u1eef li\u1ec7u \u0111\u01b0\u1ee3c cung c\u1ea5p.
                N\u1ebfu kh\u00e1ch h\u1ecfi t\u1ed3n kho theo th\u1eddi gian th\u1ef1c, h\u00e3y n\u00f3i h\u1ec7 th\u1ed1ng hi\u1ec7n ch\u01b0a x\u00e1c nh\u1eadn \u0111\u01b0\u1ee3c m\u00f3n \u0111\u00e3 h\u1ebft trong ng\u00e0y hay ch\u01b0a.
                N\u1ebfu kh\u00e1ch h\u1ecfi v\u1ec1 \u0111\u01a1n h\u00e0ng nh\u01b0ng ch\u01b0a \u0111\u0103ng nh\u1eadp, h\u00e3y y\u00eau c\u1ea7u kh\u00e1ch \u0111\u0103ng nh\u1eadp \u0111\u1ec3 ki\u1ec3m tra.
                Kh\u00f4ng \u0111\u01b0\u1ee3c b\u1ecba ra \u0111\u01a1n h\u00e0ng ngo\u00e0i danh s\u00e1ch \u0111\u01a1n h\u00e0ng g\u1ea7n \u0111\u00e2y.

                Tr\u1ea1ng th\u00e1i qu\u00e1n: %s.
                Gi\u1edd ph\u1ee5c v\u1ee5: %s.
                \u0110\u1ecba ch\u1ec9 qu\u00e1n: %s.
                C\u00e1ch \u0111\u1eb7t h\u00e0ng: kh\u00e1ch ch\u1ecdn m\u00f3n trong th\u1ef1c \u0111\u01a1n, th\u00eam v\u00e0o gi\u1ecf h\u00e0ng r\u1ed3i thanh to\u00e1n ho\u1eb7c \u0111\u1eb7t \u0111\u01a1n tr\u00ean website.
                Tr\u1ea1ng th\u00e1i \u0111\u0103ng nh\u1eadp: %s.
                \u0110\u01a1n h\u00e0ng g\u1ea7n \u0111\u00e2y c\u1ee7a kh\u00e1ch:
                %s
                Menu hi\u1ec7n t\u1ea1i:
                %s
                """.formatted(
                storeStatusService.isOpenNow() ? "\u0111ang m\u1edf c\u1eeda" : "ch\u01b0a m\u1edf c\u1eeda",
                storeStatusService.getHoursText(),
                storeStatusService.getAddress(),
                userEmail == null || userEmail.isBlank() ? "ch\u01b0a \u0111\u0103ng nh\u1eadp" : "\u0111\u00e3 \u0111\u0103ng nh\u1eadp",
                buildOrderContext(recentOrders),
                buildMenuContext(products));
    }

    private List<Order> getRecentOrders(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return List.of();
        }
        Page<Order> page = orderService.getOrders(
                userEmail,
                false,
                null,
                null,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")));
        return page.getContent();
    }

    private String buildOrderContext(List<Order> orders) {
        if (orders.isEmpty()) {
            return "- Ch\u01b0a c\u00f3 \u0111\u01a1n h\u00e0ng n\u00e0o trong ng\u1eef c\u1ea3nh";
        }
        return orders.stream()
                .map(order -> "- \u0110\u01a1n #" + order.getId()
                        + ": " + statusLabel(order.getStatus())
                        + ", " + orderTypeLabel(order.getOrderType())
                        + ", thanh to\u00e1n " + paymentLabel(order.getPaymentMethod())
                        + ", t\u1ea1o l\u00fac " + order.getCreatedAt()
                        + ", t\u1ed5ng " + formatOrderTotal(order))
                .reduce((left, right) -> left + "\n" + right)
                .orElse("- Ch\u01b0a c\u00f3 \u0111\u01a1n h\u00e0ng n\u00e0o trong ng\u1eef c\u1ea3nh");
    }

    private String buildMenuContext(List<ProductResponse> products) {
        if (products.isEmpty()) {
            return "- Ch\u01b0a c\u00f3 m\u00f3n n\u00e0o trong h\u1ec7 th\u1ed1ng";
        }
        return products.stream()
                .filter(product -> product.getName() != null)
                .sorted(Comparator.comparing(ProductResponse::getName, String.CASE_INSENSITIVE_ORDER))
                .map(product -> "- " + product.getName() + ": " + formatPrice(product)
                        + (product.getDescription() == null || product.getDescription().isBlank()
                                ? ""
                                : " - " + product.getDescription()))
                .reduce((left, right) -> left + "\n" + right)
                .orElse("- Ch\u01b0a c\u00f3 m\u00f3n n\u00e0o trong h\u1ec7 th\u1ed1ng");
    }

    private String fallbackReply(String message, List<ProductResponse> products, List<Order> recentOrders,
            String userEmail) {
        String text = normalize(message);
        Optional<ProductResponse> matchedProduct = findMentionedProduct(text, products);

        if (isAskOrder(text)) {
            return answerOrderQuestion(recentOrders, userEmail, text);
        }

        if (isAskAddress(text)) {
            return "\u0110\u1ecba ch\u1ec9 qu\u00e1n: " + storeStatusService.getAddress() + ".";
        }

        if (isAskStoreHours(text)) {
            return storeStatusService.isOpenNow()
                    ? "Qu\u00e1n \u0111ang m\u1edf c\u1eeda. Gi\u1edd ph\u1ee5c v\u1ee5 h\u00f4m nay l\u00e0 " + storeStatusService.getHoursText() + "."
                    : "Qu\u00e1n hi\u1ec7n ch\u01b0a m\u1edf c\u1eeda. Gi\u1edd ph\u1ee5c v\u1ee5 h\u00f4m nay l\u00e0 " + storeStatusService.getHoursText() + ".";
        }

        if (isAskRecommendation(text) || isAskMenu(text)) {
            return answerMenu(products);
        }

        if (matchedProduct.isPresent()) {
            return answerProductQuestion(matchedProduct, products);
        }

        if (isAskProductAvailability(text)) {
            return "B\u1ea1n cho m\u00ecnh t\u00ean m\u00f3n c\u1ee5 th\u1ec3 \u0111\u1ec3 m\u00ecnh ki\u1ec3m tra trong menu nh\u00e9.";
        }

        if (isAskDelivery(text)) {
            return "Qu\u00e1n c\u00f3 h\u1ed7 tr\u1ee3 \u0111\u1eb7t m\u00f3n tr\u00ean website. B\u1ea1n ch\u1ecdn m\u00f3n trong th\u1ef1c \u0111\u01a1n, th\u00eam v\u00e0o gi\u1ecf h\u00e0ng r\u1ed3i thanh to\u00e1n ho\u1eb7c \u0111\u1eb7t \u0111\u01a1n.";
        }

        return "AI ch\u01b0a \u0111\u01b0\u1ee3c k\u1ebft n\u1ed1i ho\u1eb7c \u0111ang l\u1ed7i, n\u00ean m\u00ecnh ch\u1ec9 tr\u1ea3 l\u1eddi \u0111\u01b0\u1ee3c c\u00e1c c\u00e2u v\u1ec1 menu, gi\u00e1 m\u00f3n, gi\u1edd m\u1edf c\u1eeda, \u0111\u1ecba ch\u1ec9, \u0111\u1eb7t h\u00e0ng v\u00e0 \u0111\u01a1n h\u00e0ng.";
    }

    private String answerOrderQuestion(List<Order> recentOrders, String userEmail, String text) {
        if (userEmail == null || userEmail.isBlank()) {
            return "B\u1ea1n c\u1ea7n \u0111\u0103ng nh\u1eadp \u0111\u1ec3 m\u00ecnh ki\u1ec3m tra \u0111\u01a1n h\u00e0ng \u0111\u00e3 \u0111\u1eb7t.";
        }
        if (recentOrders.isEmpty()) {
            return "M\u00ecnh ch\u01b0a th\u1ea5y \u0111\u01a1n h\u00e0ng n\u00e0o trong t\u00e0i kho\u1ea3n c\u1ee7a b\u1ea1n.";
        }
        if (isAskCancelOrder(text)) {
            return "Hi\u1ec7n chatbot ch\u01b0a h\u1ee7y \u0111\u01a1n tr\u1ef1c ti\u1ebfp. B\u1ea1n c\u00f3 th\u1ec3 v\u00e0o trang \u0110\u01a1n h\u00e0ng \u0111\u1ec3 xem tr\u1ea1ng th\u00e1i, ho\u1eb7c li\u00ean h\u1ec7 qu\u00e1n n\u1ebfu mu\u1ed1n h\u1ee7y \u0111\u01a1n \u0111ang ch\u1edd x\u00e1c nh\u1eadn.";
        }

        String orders = recentOrders.stream()
                .limit(3)
                .map(order -> "\u0110\u01a1n #" + order.getId() + " " + statusLabel(order.getStatus())
                        + " (" + formatOrderTotal(order) + ")")
                .reduce((left, right) -> left + "; " + right)
                .orElse("");
        return "\u0110\u01a1n g\u1ea7n \u0111\u00e2y c\u1ee7a b\u1ea1n: " + orders + ".";
    }

    private String answerProductQuestion(Optional<ProductResponse> matchedProduct, List<ProductResponse> products) {
        if (matchedProduct.isEmpty()) {
            return "M\u00ecnh ch\u01b0a t\u00ecm th\u1ea5y m\u00f3n \u0111\u00f3 trong menu hi\u1ec7n t\u1ea1i. B\u1ea1n c\u00f3 th\u1ec3 h\u1ecfi t\u00ean m\u00f3n c\u1ee5 th\u1ec3 h\u01a1n ho\u1eb7c xem trang Th\u1ef1c \u0111\u01a1n.";
        }

        ProductResponse product = matchedProduct.get();
        String storeText = storeStatusService.isOpenNow()
                ? "Qu\u00e1n \u0111ang m\u1edf c\u1eeda, b\u1ea1n c\u00f3 th\u1ec3 \u0111\u1eb7t ngay."
                : "Qu\u00e1n hi\u1ec7n ngo\u00e0i gi\u1edd ph\u1ee5c v\u1ee5, b\u1ea1n c\u00f3 th\u1ec3 xem menu v\u00e0 \u0111\u1eb7t l\u1ea1i trong khung gi\u1edd " + storeStatusService.getHoursText() + ".";

        return product.getName() + " \u0111ang c\u00f3 trong menu, gi\u00e1 " + formatPrice(product) + ". " + storeText
                + " L\u01b0u \u00fd: h\u1ec7 th\u1ed1ng hi\u1ec7n ch\u01b0a c\u00f3 t\u1ed3n kho theo th\u1eddi gian th\u1ef1c, n\u00ean bot ch\u01b0a x\u00e1c nh\u1eadn \u0111\u01b0\u1ee3c m\u00f3n \u0111\u00e3 h\u1ebft trong ng\u00e0y hay ch\u01b0a.";
    }

    private String answerMenu(List<ProductResponse> products) {
        if (products.isEmpty()) {
            return "Hi\u1ec7n menu ch\u01b0a c\u00f3 m\u00f3n n\u00e0o trong h\u1ec7 th\u1ed1ng.";
        }

        String names = products.stream()
                .filter(product -> product.getName() != null)
                .sorted(Comparator.comparing(ProductResponse::getName, String.CASE_INSENSITIVE_ORDER))
                .limit(5)
                .map(product -> product.getName() + " (" + formatPrice(product) + ")")
                .reduce((left, right) -> left + ", " + right)
                .orElse("");

        return "M\u1ed9t s\u1ed1 m\u00f3n hi\u1ec7n c\u00f3 trong menu: " + names
                + ". B\u1ea1n mu\u1ed1n m\u00ecnh g\u1ee3i \u00fd theo m\u00f3n n\u01b0\u1edbng, m\u00f3n \u0103n k\u00e8m hay theo gi\u00e1 kh\u00f4ng?";
    }

    private Optional<ProductResponse> findMentionedProduct(String text, List<ProductResponse> products) {
        Optional<ProductResponse> aliasMatch = findByCommonAlias(text, products);
        if (aliasMatch.isPresent()) {
            return aliasMatch;
        }

        return products.stream()
                .filter(product -> product.getName() != null)
                .filter(product -> hasTokenOverlap(text, normalize(product.getName())))
                .max(Comparator.comparingInt(product -> matchScore(text, normalize(product.getName()))));
    }

    private Optional<ProductResponse> findByCommonAlias(String text, List<ProductResponse> products) {
        if (text.contains("bun cha")) {
            return firstProductContaining(products, "cha");
        }
        if (text.contains("nem")) {
            return firstProductContaining(products, "nem");
        }
        if (text.contains("mam tep")) {
            return firstProductContaining(products, "tep");
        }
        return Optional.empty();
    }

    private Optional<ProductResponse> firstProductContaining(List<ProductResponse> products, String keyword) {
        return products.stream()
                .filter(product -> product.getName() != null)
                .filter(product -> normalize(product.getName()).contains(keyword))
                .findFirst();
    }

    private boolean hasTokenOverlap(String text, String productName) {
        return matchScore(text, productName) > 0;
    }

    private int matchScore(String text, String productName) {
        int score = 0;
        for (String token : text.split(" ")) {
            if (token.length() >= 3 && !GENERIC_TOKENS.contains(token) && productName.contains(token)) {
                score++;
            }
        }
        return score;
    }

    private boolean isAskProductAvailability(String text) {
        return containsAny(text, "con", "het", "co ban", "ban mon", "gia", "bao nhieu");
    }

    private boolean isAskMenu(String text) {
        return containsAny(text, "menu", "thuc don", "mon gi", "co mon nao", "ban gi", "co gi");
    }

    private boolean isAskRecommendation(String text) {
        return containsAny(text, "goi y", "mon ngon", "nen an", "an gi", "dac biet");
    }

    private boolean isAskStoreHours(String text) {
        return containsAny(text, "gio", "mo cua", "dong cua", "may gio", "het gio");
    }

    private boolean isAskDelivery(String text) {
        return containsAny(text, "ship", "giao hang", "dat hang", "dat mon");
    }

    private boolean isAskOrder(String text) {
        return containsAny(text, "don hang", "don cua toi", "da dat", "lich su", "trang thai don", "ma don",
                "huy don", "huy hang", "order");
    }

    private boolean isAskCancelOrder(String text) {
        return containsAny(text, "huy don", "huy hang", "cancel");
    }

    private boolean isAskAddress(String text) {
        return containsAny(text, "dia chi", "o dau", "cho nao", "vi tri", "duong nao", "ban do", "map");
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String formatPrice(ProductResponse product) {
        if (product.getPrice() == null) {
            return "ch\u01b0a c\u1eadp nh\u1eadt";
        }
        return product.getPrice().stripTrailingZeros().toPlainString() + "\u0111";
    }

    private String formatOrderTotal(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return "0\u0111";
        }
        return order.getItems().stream()
                .filter(item -> item.getPrice() != null && item.getQuantity() != null)
                .map(item -> item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add)
                .stripTrailingZeros()
                .toPlainString() + "\u0111";
    }

    private String statusLabel(Order.OrderStatus status) {
        if (status == null) {
            return "ch\u01b0a c\u1eadp nh\u1eadt";
        }
        return switch (status) {
            case PENDING -> "ch\u1edd x\u00e1c nh\u1eadn";
            case CONFIRMED -> "\u0111\u00e3 x\u00e1c nh\u1eadn";
            case PAID -> "\u0111\u00e3 thanh to\u00e1n";
            case COMPLETED -> "ho\u00e0n t\u1ea5t";
            case CANCELLED -> "\u0111\u00e3 h\u1ee7y";
        };
    }

    private String orderTypeLabel(Order.OrderType type) {
        if (type == null) {
            return "ch\u01b0a c\u1eadp nh\u1eadt";
        }
        return type == Order.OrderType.DELIVERY ? "giao t\u1eadn n\u01a1i" : "d\u00f9ng t\u1ea1i b\u00e0n";
    }

    private String paymentLabel(Order.PaymentMethod method) {
        if (method == null) {
            return "ch\u01b0a ch\u1ecdn";
        }
        return switch (method) {
            case COD -> "khi nh\u1eadn m\u00f3n";
            case BANK_TRANSFER -> "chuy\u1ec3n kho\u1ea3n";
            case CARD -> "th\u1ebb";
            case MOMO -> "MOMO";
            case VNPAY -> "VNPay";
        };
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        String withoutDiacritics = DIACRITICS.matcher(Normalizer.normalize(value, Normalizer.Form.NFD)).replaceAll("");
        return withoutDiacritics
                .replace('\u0111', 'd')
                .replace('\u0110', 'D')
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("\\s+", " ");
    }
}
