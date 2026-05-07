package vn.hoidanit.springrestwithai.features.notifications.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import vn.hoidanit.springrestwithai.features.notifications.infrastructure.persistence.NotificationRepository;
import vn.hoidanit.springrestwithai.model.Notification;
import vn.hoidanit.springrestwithai.model.Order;
import vn.hoidanit.springrestwithai.model.User;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationStreamService notificationStreamService;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("Creates unread notification and emits SSE payload")
    void createNotificationDefaultsUnreadAndEmits() {
        Notification notification = new Notification();
        notification.setTitle("Title");
        notification.setContent("Content");

        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        Notification result = notificationService.createNotification(notification);

        assertEquals(Notification.Status.UNREAD, result.getStatus());
        verify(notificationStreamService).emit(result);
    }

    @Test
    @DisplayName("Creates order notification with order context")
    void createOrderNotificationBuildsContent() {
        User user = new User();
        user.setName("Admin User");

        Order order = new Order();
        order.setId(12L);
        order.setUser(user);
        order.setOrderType(Order.OrderType.DINE_IN);
        order.setTableNumber("B1");

        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Notification result = notificationService.createOrderNotification(order);

        assertEquals("New order", result.getTitle());
        assertEquals("Order #12 (DINE_IN) from Admin User, table B1", result.getContent());
    }

    @Test
    @DisplayName("Marks one notification as read")
    void markAsReadUpdatesStatus() {
        Notification notification = new Notification();
        notification.setId(3L);
        notification.setTitle("Title");
        notification.setContent("Content");
        notification.setStatus(Notification.Status.UNREAD);

        when(notificationRepository.findById(3L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(notification)).thenReturn(notification);

        Notification result = notificationService.markAsRead(3L);

        assertEquals(Notification.Status.READ, result.getStatus());
    }

    @Test
    @DisplayName("Marks all notifications as read")
    void markAllAsReadUpdatesAllStatuses() {
        Notification unread = new Notification();
        unread.setStatus(Notification.Status.UNREAD);
        Notification read = new Notification();
        read.setStatus(Notification.Status.READ);
        List<Notification> notifications = List.of(unread, read);

        when(notificationRepository.findAll()).thenReturn(notifications);
        when(notificationRepository.saveAll(notifications)).thenReturn(notifications);

        List<Notification> result = notificationService.markAllAsRead();

        assertEquals(Notification.Status.READ, result.get(0).getStatus());
        assertEquals(Notification.Status.READ, result.get(1).getStatus());
    }
}
