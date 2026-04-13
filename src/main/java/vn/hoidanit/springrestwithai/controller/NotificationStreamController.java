package vn.hoidanit.springrestwithai.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import vn.hoidanit.springrestwithai.service.NotificationStreamService;

@RestController
@RequestMapping("/notifications")
public class NotificationStreamController {

    private final NotificationStreamService notificationStreamService;
    private final JwtDecoder jwtDecoder;

    public NotificationStreamController(NotificationStreamService notificationStreamService, JwtDecoder jwtDecoder) {
        this.notificationStreamService = notificationStreamService;
        this.jwtDecoder = jwtDecoder;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam("token") String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token");
        }

        Jwt jwt;
        try {
            jwt = jwtDecoder.decode(token);
        } catch (JwtException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        if (!hasAdminRole(jwt)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }

        return notificationStreamService.subscribe();
    }

    private boolean hasAdminRole(Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList("roles");
        if (roles == null) {
            return false;
        }
        return roles.contains("ROLE_ADMIN") || roles.contains("ADMIN");
    }
}
