package vn.hoidanit.springrestwithai.features.payments.vnpay.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.features.orders.application.OrderService;
import vn.hoidanit.springrestwithai.features.payments.vnpay.infrastructure.config.VnpayProperties;
import vn.hoidanit.springrestwithai.features.payments.vnpay.model.VnpayIpnResponse;
import vn.hoidanit.springrestwithai.features.payments.vnpay.model.VnpayPaymentResponse;
import vn.hoidanit.springrestwithai.model.Order;

@Service
public class VnpayService {

    private static final Logger log = LoggerFactory.getLogger(VnpayService.class);
    private static final ZoneId VNPAY_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final BigDecimal CART_PRICE_UNIT_TO_VND = BigDecimal.valueOf(10_000L);
    private static final BigDecimal DELIVERY_FEE_IN_CART_UNITS = BigDecimal.valueOf(2.5d);
    // VNPay samples use URL-encoding compatible with application/x-www-form-urlencoded (spaces become '+').
    private static final Charset VNPAY_URL_CHARSET = StandardCharsets.UTF_8;
    private static final Pattern IPV4_PATTERN = Pattern
            .compile("^(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)){3}$");

    private final VnpayProperties properties;
    private final OrderService orderService;

    public VnpayService(VnpayProperties properties, OrderService orderService) {
        this.properties = properties;
        this.orderService = orderService;
    }

    public VnpayPaymentResponse createPaymentUrl(Long orderId, String userEmail, boolean isAdmin, String clientIp) {
        requireEnabled();

        Order order = orderService.getAccessibleOrder(orderId, userEmail, isAdmin);
        if (order.getPaymentMethod() != Order.PaymentMethod.VNPAY) {
            throw new IllegalArgumentException("Don hang khong su dung VNPay");
        }
        if (order.getStatus() == Order.OrderStatus.PAID
                || order.getStatus() == Order.OrderStatus.COMPLETED
                || order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Don hang da ket thuc, khong the thanh toan lai");
        }

        long amount = calculateAmount(order);
        if (amount <= 0L) {
            throw new IllegalArgumentException("Don hang khong hop le");
        }

        String tmnCode = requireText(properties.getTmnCode(), "VNPAY tmnCode");
        String hashSecret = requireText(properties.getHashSecret(), "VNPAY hashSecret");
        // Avoid logging sensitive request material at info level.
        log.info("VNPay config tmnCode={}, hashSecretLength={}", tmnCode, hashSecret.length());
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", valueOrDefault(properties.getVersion(), "2.1.0"));
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", String.valueOf(amount * 100L));
        params.put("vnp_CreateDate", formatNow(Instant.now()));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_IpAddr", sanitizeIp(valueOrDefault(clientIp, "127.0.0.1")));
        params.put("vnp_Locale", valueOrDefault(properties.getLocale(), "vn"));
        params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getId());
        params.put("vnp_OrderType", valueOrDefault(properties.getOrderType(), "other"));
        params.put("vnp_ReturnUrl", requireText(properties.getReturnUrl(), "VNPAY returnUrl"));
        params.put("vnp_TxnRef", String.valueOf(order.getId()));
        params.put("vnp_ExpireDate", formatNow(Instant.now().plusSeconds(Math.max(1, properties.getExpireMinutes()) * 60L)));
        BuiltVnpayRequest built = buildQueryAndHashData(params);
        String secureHash = hmacSha512(hashSecret, built.hashData);
        String paymentUrl = requireText(properties.getPaymentUrl(), "VNPAY paymentUrl") + "?" + built.query
                + "&vnp_SecureHash=" + secureHash;
        log.info("VNPay payment request orderId={}, amount={}, txnRef={}", order.getId(), amount, order.getId());
        log.debug("VNPay payment request detail hashData={}, query={}, secureHash={}", built.hashData, built.query,
                secureHash);

        return new VnpayPaymentResponse(order.getId(), paymentUrl, String.valueOf(order.getId()), amount);
    }

    public VnpayIpnResponse handleIpn(Map<String, String> params) {
        requireEnabled();

        if (params == null || params.isEmpty()) {
            return new VnpayIpnResponse("99", "Invalid request");
        }

        String secureHash = params.get("vnp_SecureHash");
        if (!isValidSignature(params, secureHash)) {
            return new VnpayIpnResponse("97", "Invalid Signature");
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");
        String amountValue = params.get("vnp_Amount");

        if (!StringUtils.hasText(txnRef)) {
            return new VnpayIpnResponse("01", "Order not found");
        }

        Long orderId;
        try {
            orderId = Long.valueOf(txnRef);
        } catch (NumberFormatException ex) {
            return new VnpayIpnResponse("01", "Order not found");
        }

        Order order;
        try {
            order = orderService.getAccessibleOrder(orderId, null, true);
        } catch (ResourceNotFoundException ex) {
            return new VnpayIpnResponse("01", "Order not found");
        }

        if (order.getPaymentMethod() != Order.PaymentMethod.VNPAY) {
            return new VnpayIpnResponse("01", "Order not found");
        }
        if (order.getStatus() == Order.OrderStatus.PAID || order.getStatus() == Order.OrderStatus.COMPLETED
                || order.getStatus() == Order.OrderStatus.CANCELLED) {
            return new VnpayIpnResponse("02", "Order already confirmed");
        }

        long expectedAmount = calculateAmount(order) * 100L;
        long receivedAmount = parseLong(amountValue);
        if (expectedAmount != receivedAmount) {
            return new VnpayIpnResponse("04", "Invalid amount");
        }

        boolean success = "00".equals(responseCode) && "00".equals(transactionStatus);
        orderService.updatePaymentResult(order.getId(), success);
        if (success) {
            return new VnpayIpnResponse("00", "Confirm Success");
        }
        return new VnpayIpnResponse("00", "Confirm Success");
    }

    private void requireEnabled() {
        if (!properties.isEnabled()) {
            throw new IllegalArgumentException("VNPay đang tắt. Hãy bật app.payment.vnpay.enabled=true");
        }
        if (!StringUtils.hasText(properties.getTmnCode()) || !StringUtils.hasText(properties.getHashSecret())) {
            throw new IllegalArgumentException(
                    "VNPay đang bật nhưng thiếu cấu hình. Vui lòng set app.payment.vnpay.tmn-code và app.payment.vnpay.hash-secret");
        }
    }

    private record BuiltVnpayRequest(String query, String hashData) {
    }

    private BuiltVnpayRequest buildQueryAndHashData(Map<String, String> params) {
        StringBuilder query = new StringBuilder();
        StringBuilder hashData = new StringBuilder();

        for (Map.Entry<String, String> entry : params.entrySet()) {
            String fieldName = entry.getKey();
            String fieldValue = entry.getValue();
            if (!StringUtils.hasText(fieldValue)) {
                continue;
            }

            if (query.length() > 0) {
                query.append('&');
                hashData.append('&');
            }

            // VNPay signature: sort by key, then sign `key=value` pairs joined by '&' where values
            // are URL-encoded the same way as the query string. If you sign raw values (spaces, URLs),
            // VNPay will treat it as an invalid signature.
            hashData.append(fieldName);
            hashData.append('=');
            hashData.append(urlEncode(fieldValue));

            query.append(urlEncode(fieldName));
            query.append('=');
            query.append(urlEncode(fieldValue));
        }

        return new BuiltVnpayRequest(query.toString(), hashData.toString());
    }

    private boolean isValidSignature(Map<String, String> params, String secureHash) {
        if (!StringUtils.hasText(secureHash)) {
            return false;
        }

        Map<String, String> filtered = new TreeMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            if (key == null) {
                continue;
            }
            if (key.startsWith("vnp_") && !"vnp_SecureHash".equals(key) && !"vnp_SecureHashType".equals(key)) {
                filtered.put(key, entry.getValue());
            }
        }

        BuiltVnpayRequest built = buildQueryAndHashData(filtered);
        String expected = hmacSha512(requireText(properties.getHashSecret(), "VNPAY hashSecret"), built.hashData);
        return expected.equalsIgnoreCase(secureHash);
    }

    private long calculateAmount(Order order) {
        BigDecimal totalUnits = BigDecimal.ZERO;
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                if (item.getPrice() != null && item.getQuantity() != null) {
                    totalUnits = totalUnits.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            }
        }
        if (order.getOrderType() == Order.OrderType.DELIVERY) {
            totalUnits = totalUnits.add(DELIVERY_FEE_IN_CART_UNITS);
        }
        BigDecimal amount = totalUnits.multiply(CART_PRICE_UNIT_TO_VND);
        return amount.setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    private String formatNow(Instant instant) {
        return VNPAY_DATE_FORMAT.format(instant.atZone(VNPAY_ZONE));
    }

    private String sanitizeIp(String rawIp) {
        if (!StringUtils.hasText(rawIp)) {
            return "127.0.0.1";
        }
        String candidate = rawIp.trim();
        if (candidate.contains(",")) {
            candidate = candidate.split(",")[0].trim();
        }
        if (candidate.startsWith("[") && candidate.contains("]")) {
            candidate = candidate.substring(1, candidate.indexOf(']'));
        } else if (candidate.indexOf(':') > -1 && candidate.indexOf(':') == candidate.lastIndexOf(':')
                && candidate.contains(".")) {
            // IPv4 with port (e.g. 1.2.3.4:5678)
            candidate = candidate.substring(0, candidate.indexOf(':'));
        }
        if (IPV4_PATTERN.matcher(candidate).matches()) {
            return candidate;
        }
        // VNPay typically expects IPv4; fall back to localhost to avoid invalid ip format.
        return "127.0.0.1";
    }

    private String hmacSha512(String secret, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            hmac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Khong the ky VNPay request", ex);
        }
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value == null ? "" : value, VNPAY_URL_CHARSET);
    }

    private String requireText(String value, String fieldName) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException("Thiếu cấu hình: " + fieldName);
        }
        return value;
    }

    private String valueOrDefault(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }

    private long parseLong(String value) {
        if (!StringUtils.hasText(value)) {
            return 0L;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return 0L;
        }
    }
}
