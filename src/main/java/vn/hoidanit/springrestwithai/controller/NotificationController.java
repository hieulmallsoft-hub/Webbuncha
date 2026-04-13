package vn.hoidanit.springrestwithai.controller;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.hoidanit.springrestwithai.helper.ApiResponse;
import vn.hoidanit.springrestwithai.model.Notification;
import vn.hoidanit.springrestwithai.model.dto.request.NotificationRequest;
import vn.hoidanit.springrestwithai.model.dto.response.NotificationResponse;
import vn.hoidanit.springrestwithai.service.NotificationService;

@RestController
@RequestMapping("/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAllNotifications() {
        List<NotificationResponse> responses = notificationService.getAllNotifications().stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Get notifications success", responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(@PathVariable Long id) {
        Notification notification = notificationService.getNotificationById(id);
        return ResponseEntity.ok(ApiResponse.success("Get notification success", NotificationResponse.from(notification)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(
            @Valid @RequestBody NotificationRequest request) {
        Notification created = notificationService.createNotification(request.toNotification());
        URI location = URI.create("/notifications/" + created.getId());
        return ResponseEntity.created(location)
                .body(ApiResponse.created("Create notification success", NotificationResponse.from(created)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> updateNotification(@PathVariable Long id,
            @Valid @RequestBody NotificationRequest request) {
        Notification updated = notificationService.updateNotification(id, request.toNotification());
        return ResponseEntity.ok(ApiResponse.success("Update notification success", NotificationResponse.from(updated)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
