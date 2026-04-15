package vn.hoidanit.springrestwithai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.hoidanit.springrestwithai.config.FirebasePushProperties;
import vn.hoidanit.springrestwithai.helper.ApiResponse;
import vn.hoidanit.springrestwithai.model.dto.request.PushTokenRequest;
import vn.hoidanit.springrestwithai.model.dto.response.PushPublicConfigResponse;
import vn.hoidanit.springrestwithai.service.DeviceTokenService;

@RestController
@RequestMapping("/push")
public class PushNotificationController {

    private final FirebasePushProperties pushProperties;
    private final DeviceTokenService deviceTokenService;

    public PushNotificationController(FirebasePushProperties pushProperties, DeviceTokenService deviceTokenService) {
        this.pushProperties = pushProperties;
        this.deviceTokenService = deviceTokenService;
    }

    @GetMapping("/public-config")
    public ResponseEntity<ApiResponse<PushPublicConfigResponse>> getPublicConfig() {
        return ResponseEntity.ok(ApiResponse.success(PushPublicConfigResponse.from(pushProperties)));
    }

    @PostMapping("/tokens/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Boolean>> registerToken(@Valid @RequestBody PushTokenRequest request,
            Authentication authentication) {
        deviceTokenService.registerAdminToken(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Dang ky thiet bi nhan thong bao thanh cong", Boolean.TRUE));
    }

    @PostMapping("/tokens/unregister")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Boolean>> unregisterToken(@Valid @RequestBody PushTokenRequest request,
            Authentication authentication) {
        deviceTokenService.unregisterAdminToken(authentication.getName(), request.getToken());
        return ResponseEntity.ok(ApiResponse.success("Huy dang ky thiet bi nhan thong bao thanh cong", Boolean.TRUE));
    }
}
