package vn.hoidanit.springrestwithai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.hoidanit.springrestwithai.helper.ApiResponse;
import vn.hoidanit.springrestwithai.model.dto.request.LoginRequest;
import vn.hoidanit.springrestwithai.model.dto.request.RefreshTokenRequest;
import vn.hoidanit.springrestwithai.model.dto.request.RegisterRequest;
import vn.hoidanit.springrestwithai.model.dto.response.RegisterRespone;
import vn.hoidanit.springrestwithai.model.dto.response.TokenResponse;
import vn.hoidanit.springrestwithai.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;

    public AuthController(AuthenticationManager authenticationManager, AuthService authService) {
        this.authenticationManager = authenticationManager;
        this.authService = authService;
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
    public ResponseEntity<ApiResponse<RegisterRespone>> register(@Valid @RequestBody RegisterRequest request) {
        RegisterRespone response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
