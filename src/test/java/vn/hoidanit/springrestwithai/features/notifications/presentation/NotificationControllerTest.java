package vn.hoidanit.springrestwithai.features.notifications.presentation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import vn.hoidanit.springrestwithai.features.notifications.application.NotificationService;
import vn.hoidanit.springrestwithai.model.Notification;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationController")
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(new NotificationController(notificationService)).build();
    }

    @Test
    @DisplayName("Lists notifications")
    void listNotifications() throws Exception {
        Notification notification = buildNotification(1L, Notification.Status.UNREAD);
        when(notificationService.getAllNotifications()).thenReturn(List.of(notification));

        mockMvc.perform(get("/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].status").value("UNREAD"));
    }

    @Test
    @DisplayName("Creates notification")
    void createNotification() throws Exception {
        Notification notification = buildNotification(2L, Notification.Status.UNREAD);
        when(notificationService.createNotification(any(Notification.class))).thenReturn(notification);

        mockMvc.perform(post("/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "New order",
                                  "content": "Order #2",
                                  "status": "UNREAD"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(2));
    }

    @Test
    @DisplayName("Marks one notification as read")
    void markAsRead() throws Exception {
        Notification notification = buildNotification(3L, Notification.Status.READ);
        when(notificationService.markAsRead(3L)).thenReturn(notification);

        mockMvc.perform(patch("/notifications/3/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("READ"));
    }

    @Test
    @DisplayName("Marks all notifications as read")
    void markAllAsRead() throws Exception {
        Notification notification = buildNotification(4L, Notification.Status.READ);
        when(notificationService.markAllAsRead()).thenReturn(List.of(notification));

        mockMvc.perform(patch("/notifications/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].status").value("READ"));
    }

    private Notification buildNotification(Long id, Notification.Status status) {
        Notification notification = new Notification();
        notification.setId(id);
        notification.setTitle("New order");
        notification.setContent("Order #" + id);
        notification.setStatus(status);
        return notification;
    }
}
