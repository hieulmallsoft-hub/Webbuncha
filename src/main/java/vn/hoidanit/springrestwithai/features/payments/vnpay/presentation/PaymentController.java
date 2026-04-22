package vn.hoidanit.springrestwithai.features.payments.vnpay.presentation;

import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.hoidanit.springrestwithai.helper.ApiResponse;
import vn.hoidanit.springrestwithai.features.payments.vnpay.application.VnpayService;
import vn.hoidanit.springrestwithai.features.payments.vnpay.model.VnpayIpnResponse;
import vn.hoidanit.springrestwithai.features.payments.vnpay.model.VnpayPaymentResponse;

@RestController
@RequestMapping("/payments/vnpay")
public class PaymentController {

    private final VnpayService vnpayService;

    public PaymentController(VnpayService vnpayService) {
        this.vnpayService = vnpayService;
    }

    @PostMapping("/{orderId}")
    public ResponseEntity<ApiResponse<VnpayPaymentResponse>> createPaymentUrl(@PathVariable Long orderId,
            Authentication authentication, HttpServletRequest request) {
        boolean isAdmin = hasRole(authentication, "ADMIN");
        String clientIp = extractClientIp(request);
        VnpayPaymentResponse response = vnpayService.createPaymentUrl(orderId, authentication.getName(), isAdmin,
                clientIp);
        return ResponseEntity.ok(ApiResponse.success("Tao URL thanh toan VNPay thanh cong", response));
    }

    @GetMapping("/ipn")
    public ResponseEntity<VnpayIpnResponse> ipn(@RequestParam Map<String, String> params) {
        VnpayIpnResponse response = vnpayService.handleIpn(new HashMap<>(params));
        return ResponseEntity.ok(response);
    }

    private boolean hasRole(Authentication authentication, String role) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        String normalized = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> role.equals(authority.getAuthority())
                        || normalized.equals(authority.getAuthority()));
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
