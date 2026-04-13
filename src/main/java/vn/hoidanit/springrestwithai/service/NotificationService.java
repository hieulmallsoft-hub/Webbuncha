package vn.hoidanit.springrestwithai.service;

import java.util.List;

import org.springframework.stereotype.Service;

import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.model.Order;
import vn.hoidanit.springrestwithai.model.Notification;
import vn.hoidanit.springrestwithai.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationStreamService notificationStreamService;

    public NotificationService(NotificationRepository notificationRepository,
            NotificationStreamService notificationStreamService) {
        this.notificationRepository = notificationRepository;
        this.notificationStreamService = notificationStreamService;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
    }

    public Notification createNotification(Notification notification) {
        if (notification.getStatus() == null) {
            notification.setStatus(Notification.Status.UNREAD);
        }
        Notification saved = notificationRepository.save(notification);
        notificationStreamService.emit(saved);
        return saved;
    }

    public Notification createOrderNotification(Order order) {
        Notification notification = new Notification();
        notification.setTitle("Đơn hàng mới");

        String customer = order.getReceiverName();
        if (isBlank(customer) && order.getUser() != null) {
            customer = order.getUser().getName();
        }

        StringBuilder content = new StringBuilder("Đơn #");
        if (order.getId() != null) {
            content.append(order.getId());
        }
        if (order.getOrderType() != null) {
            content.append(" (").append(order.getOrderType().name()).append(")");
        }
        if (!isBlank(customer)) {
            content.append(" từ ").append(customer);
        }
        if (!isBlank(order.getTableNumber())) {
            content.append(", bàn ").append(order.getTableNumber());
        }
        if (!isBlank(order.getDeliveryAddress())) {
            content.append(", ").append(order.getDeliveryAddress());
        }

        notification.setContent(content.toString());
        return createNotification(notification);
    }

    public Notification updateNotification(Long id, Notification update) {
        Notification existing = getNotificationById(id);

        if (update.getTitle() != null) {
            existing.setTitle(update.getTitle());
        }
        if (update.getContent() != null) {
            existing.setContent(update.getContent());
        }
        if (update.getStatus() != null) {
            existing.setStatus(update.getStatus());
        }

        return notificationRepository.save(existing);
    }

    public void deleteNotification(Long id) {
        getNotificationById(id);
        notificationRepository.deleteById(id);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
