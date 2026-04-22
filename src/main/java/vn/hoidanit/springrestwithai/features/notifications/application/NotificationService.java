package vn.hoidanit.springrestwithai.features.notifications.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.features.notifications.infrastructure.persistence.Notification;
import vn.hoidanit.springrestwithai.features.notifications.infrastructure.persistence.NotificationRepository;
import vn.hoidanit.springrestwithai.model.Order;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationStreamService notificationStreamService;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationStreamService notificationStreamService
    ) {
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

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification createNotification(Notification notification) {
        if (notification.getStatus() == null) {
            notification.setStatus(Notification.Status.UNREAD);
        }
        Notification saved = notificationRepository.save(notification);
        notificationStreamService.emit(saved);
        return saved;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification createOrderNotification(Order order) {
        Notification notification = new Notification();
        notification.setTitle("New order");

        String customer = order.getReceiverName();
        if (isBlank(customer) && order.getUser() != null) {
            customer = order.getUser().getName();
        }

        StringBuilder content = new StringBuilder("Order #");
        if (order.getId() != null) {
            content.append(order.getId());
        }
        if (order.getOrderType() != null) {
            content.append(" (").append(order.getOrderType().name()).append(")");
        }
        if (!isBlank(customer)) {
            content.append(" from ").append(customer);
        }
        if (!isBlank(order.getTableNumber())) {
            content.append(", table ").append(order.getTableNumber());
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

