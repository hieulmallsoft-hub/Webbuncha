package vn.hoidanit.springrestwithai.features.auth.presentation;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.hoidanit.springrestwithai.features.auth.application.AuthService;
import vn.hoidanit.springrestwithai.features.auth.application.AuthTokenService;
import vn.hoidanit.springrestwithai.features.auth.presentation.dto.request.LoginRequest;
import vn.hoidanit.springrestwithai.features.auth.presentation.dto.request.ForgotPasswordRequest;
import vn.hoidanit.springrestwithai.features.auth.presentation.dto.request.ResetPasswordRequest;
import vn.hoidanit.springrestwithai.features.auth.presentation.dto.request.ResendVerificationRequest;
import vn.hoidanit.springrestwithai.features.auth.presentation.dto.request.RefreshTokenRequest;
import vn.hoidanit.springrestwithai.features.auth.presentation.dto.request.RegisterRequest;
import vn.hoidanit.springrestwithai.features.auth.presentation.dto.response.RegisterResponse;
import vn.hoidanit.springrestwithai.features.auth.presentation.dto.response.TokenResponse;
import vn.hoidanit.springrestwithai.helper.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final AuthTokenService authTokenService;

    public AuthController(AuthenticationManager authenticationManager, AuthService authService,
            AuthTokenService authTokenService) {
        this.authenticationManager = authenticationManager;
        this.authService = authService;
        this.authTokenService = authTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(ApiResponse.unauthorized("Dang nhap that bai"));
            }
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(ApiResponse.unauthorized("Dang nhap that bai"));
        }

        TokenResponse response = authService.login(loginRequest.getEmail());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        RegisterResponse response = authService.register(request);
        authTokenService.requestEmailVerification(request.getEmail(), getClientIp(httpRequest),
                httpRequest != null ? httpRequest.getHeader("User-Agent") : null);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {
        authTokenService.requestPasswordResetSms(request.getPhone(), getClientIp(httpRequest),
                httpRequest != null ? httpRequest.getHeader("User-Agent") : null);
        // Always return success to avoid email enumeration.
        return ResponseEntity.ok(ApiResponse.success("Neu so dien thoai ton tai, OTP dat lai mat khau da duoc gui", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authTokenService.resetPassword(request.getPhone(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Dat lai mat khau thanh cong", null));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam("token") String token) {
        authTokenService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Xac thuc email thanh cong", null));
    }

    @PostMapping("/verify-email/resend")
    public ResponseEntity<ApiResponse<Void>> resendVerifyEmail(@Valid @RequestBody ResendVerificationRequest request,
            HttpServletRequest httpRequest) {
        authTokenService.requestEmailVerification(request.getEmail(), getClientIp(httpRequest),
                httpRequest != null ? httpRequest.getHeader("User-Agent") : null);
        return ResponseEntity.ok(ApiResponse.success("Neu email ton tai, email xac thuc da duoc gui", null));
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
