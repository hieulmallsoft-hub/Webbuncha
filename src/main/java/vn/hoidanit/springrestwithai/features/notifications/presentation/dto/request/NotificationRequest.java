package vn.hoidanit.springrestwithai.features.notifications.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import vn.hoidanit.springrestwithai.features.notifications.infrastructure.persistence.Notification;

public class NotificationRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be <= 255 chars")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(max = 1000, message = "Content must be <= 1000 chars")
    private String content;

    private Notification.Status status;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Notification.Status getStatus() {
        return status;
    }

    public void setStatus(Notification.Status status) {
        this.status = status;
    }

    public Notification toNotification() {
        Notification notification = new Notification();
        notification.setTitle(this.title);
        notification.setContent(this.content);
        notification.setStatus(this.status);
        return notification;
    }
}

