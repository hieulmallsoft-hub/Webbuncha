package vn.hoidanit.springrestwithai.service;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.hoidanit.springrestwithai.exception.InvalidSessionException;
import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.model.Order;
import vn.hoidanit.springrestwithai.model.OrderItem;
import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.model.dto.request.OrderItemRequest;
import vn.hoidanit.springrestwithai.model.dto.request.OrderRequest;
import vn.hoidanit.springrestwithai.repository.OrderRepository;
import vn.hoidanit.springrestwithai.repository.OrderSpecifications;
import vn.hoidanit.springrestwithai.repository.UserRepository;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PushNotificationService pushNotificationService;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository,
            NotificationService notificationService,
            PushNotificationService pushNotificationService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.pushNotificationService = pushNotificationService;
    }

    public Page<Order> getOrders(String userEmail, boolean isAdmin, Long userIdFilter,
            Order.OrderStatus status, Order.OrderType orderType, Order.PaymentMethod paymentMethod,
            Instant from, Instant to, Pageable pageable) {

        Long effectiveUserId = null;
        if (!isAdmin) {
            User currentUser = getUserByEmail(userEmail);
            effectiveUserId = currentUser.getId();
        } else if (userIdFilter != null) {
            effectiveUserId = userIdFilter;
        }

        Specification<Order> spec = Specification.where(OrderSpecifications.hasUserId(effectiveUserId))
                .and(OrderSpecifications.hasStatus(status))
                .and(OrderSpecifications.hasOrderType(orderType))
                .and(OrderSpecifications.hasPaymentMethod(paymentMethod))
                .and(OrderSpecifications.createdAtFrom(from))
                .and(OrderSpecifications.createdAtTo(to));

        return this.orderRepository.findAll(spec, pageable);
    }

    public Order getOrderById(Long id, String userEmail, boolean isAdmin) {
        Order order = getOrderByIdInternal(id);
        if (!isAdmin) {
            User currentUser = getUserByEmail(userEmail);
            assertOwnerOrAdmin(order, currentUser, false);
        }
        return order;
    }
    @Transactional
    public Order createOrder(String userEmail, OrderRequest request) {
        validateOrderRequest(request);

        User currentUser = getUserByEmail(userEmail);
        Order order = new Order();
        order.setUser(currentUser);
        applyRequest(order, request);

        if (order.getPaymentMethod() == null) {
            order.setPaymentMethod(Order.PaymentMethod.COD);
        }

        order.setStatus(Order.OrderStatus.PENDING);
        normalizeByType(order);

        Order saved = this.orderRepository.save(order);
        notificationService.createOrderNotification(saved);

        try {
            pushNotificationService.sendOrderCreatedNotification(saved);
        } catch (Exception e) {
            // log loi, khong lam fail order
        }

        return saved;
    }

    public Order updateOrder(Long id, OrderRequest request, String userEmail, boolean isAdmin) {
        Order existing = getOrderByIdInternal(id);
        User currentUser = getUserByEmail(userEmail);
        assertOwnerOrAdmin(existing, currentUser, isAdmin);

        validateOrderRequest(request);
        applyRequest(existing, request);
        if (existing.getPaymentMethod() == null) {
            existing.setPaymentMethod(Order.PaymentMethod.COD);
        }
        normalizeByType(existing);
        return this.orderRepository.save(existing);
    }

    public Order updateStatus(Long id, Order.OrderStatus status) {
        Order existing = getOrderByIdInternal(id);
        validateStatusTransition(existing.getStatus(), status);
        existing.setStatus(status);
        return this.orderRepository.save(existing);
    }

    public void deleteOrder(Long id) {
        getOrderByIdInternal(id);
        this.orderRepository.deleteById(id);
    }

    private Order getOrderByIdInternal(Long id) {
        return this.orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Don hang", "id", id));
    }

    private User getUserByEmail(String email) {
        return this.userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidSessionException(
                        "Phien dang nhap khong con hop le. Vui long dang nhap lai."));
    }

    private void assertOwnerOrAdmin(Order order, User currentUser, boolean isAdmin) {
        if (isAdmin) {
            return;
        }
        if (order.getUser() == null || currentUser == null || order.getUser().getId() == null) {
            throw new AccessDeniedException("Khong co quyen truy cap don hang");
        }
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Khong co quyen truy cap don hang");
        }
    }

    private void applyRequest(Order order, OrderRequest request) {
        order.setDescription(request.getDescription());
        order.setOrderType(request.getOrderType());
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setTableNumber(request.getTableNumber());
        order.setReservationTime(request.getReservationTime());
        order.setPaymentMethod(request.getPaymentMethod());
        applyItems(order, request.getItems());
    }

    private void applyItems(Order order, List<OrderItemRequest> items) {
        order.getItems().clear();
        if (items == null) {
            return;
        }
        for (OrderItemRequest itemRequest : items) {
            OrderItem item = new OrderItem();
            item.setProduct(itemRequest.getProduct());
            item.setQuantity(itemRequest.getQuantity());
            item.setPrice(itemRequest.getPrice());
            item.setDescription(itemRequest.getDescription());
            item.setOrder(order);
            order.getItems().add(item);
        }
    }

    private void validateOrderRequest(OrderRequest request) {
        if (request.getOrderType() == null) {
            throw new IllegalArgumentException("Loai don khong duoc de trong");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Don hang phai co it nhat mot mon");
        }

        if (request.getOrderType() == Order.OrderType.DELIVERY) {
            if (isBlank(request.getReceiverName())) {
                throw new IllegalArgumentException("Ten nguoi nhan khong duoc de trong");
            }
            if (isBlank(request.getReceiverPhone())) {
                throw new IllegalArgumentException("So dien thoai khong duoc de trong");
            }
            if (isBlank(request.getDeliveryAddress())) {
                throw new IllegalArgumentException("Dia chi giao hang khong duoc de trong");
            }
        }

        if (request.getOrderType() == Order.OrderType.DINE_IN) {
            if (isBlank(request.getTableNumber()) && request.getReservationTime() == null) {
                throw new IllegalArgumentException("Don tai quan can so ban hoac thoi gian dat ban");
            }
        }
    }

    private void normalizeByType(Order order) {
        if (order.getOrderType() == Order.OrderType.DELIVERY) {
            order.setTableNumber(null);
            order.setReservationTime(null);
        }
        if (order.getOrderType() == Order.OrderType.DINE_IN) {
            order.setReceiverName(null);
            order.setReceiverPhone(null);
            order.setDeliveryAddress(null);
        }
    }

    private void validateStatusTransition(Order.OrderStatus current, Order.OrderStatus target) {
        if (target == null) {
            throw new IllegalArgumentException("Trang thai khong duoc de trong");
        }
        if (current == null || current == target) {
            return;
        }

        switch (current) {
            case PENDING:
                if (target != Order.OrderStatus.CONFIRMED
                        && target != Order.OrderStatus.CANCELLED
                        && target != Order.OrderStatus.PAID) {
                    throw new IllegalArgumentException("Khong the chuyen trang thai tu PENDING sang " + target);
                }
                break;
            case CONFIRMED:
                if (target != Order.OrderStatus.PAID && target != Order.OrderStatus.CANCELLED) {
                    throw new IllegalArgumentException("Khong the chuyen trang thai tu CONFIRMED sang " + target);
                }
                break;
            case PAID:
                if (target != Order.OrderStatus.COMPLETED) {
                    throw new IllegalArgumentException("Khong the chuyen trang thai tu PAID sang " + target);
                }
                break;
            case COMPLETED:
            case CANCELLED:
                throw new IllegalArgumentException("Don da ket thuc, khong the thay doi trang thai");
            default:
                break;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
