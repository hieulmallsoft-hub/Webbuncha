package vn.hoidanit.springrestwithai.model.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import vn.hoidanit.springrestwithai.model.Order;
import vn.hoidanit.springrestwithai.model.OrderItem;

public class OrderResponse {
    
    private Long id;
    private String description;
    private BigDecimal totalPrice;
    private Order.OrderType orderType;
    private String receiverName;
    private String receiverPhone;
    private String deliveryAddress;
    private String tableNumber;
    private LocalDateTime reservationTime;
    private Order.PaymentMethod paymentMethod;
    private Order.OrderStatus status;
    private Long userId;
    private String userEmail;
    private List<OrderItemResponse> items;
    private Instant createdAt;
    private Instant updatedAt;

    public static OrderResponse from(Order order) {
        OrderResponse dto = new OrderResponse();
        dto.setId(order.getId());
        dto.setDescription(order.getDescription());
        dto.setTotalPrice(calculateTotal(order.getItems()));
        dto.setOrderType(order.getOrderType());
        dto.setReceiverName(order.getReceiverName());
        dto.setReceiverPhone(order.getReceiverPhone());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setTableNumber(order.getTableNumber());
        dto.setReservationTime(order.getReservationTime());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setStatus(order.getStatus());
        if (order.getUser() != null) {
            dto.setUserId(order.getUser().getId());
            dto.setUserEmail(order.getUser().getEmail());
        }
        dto.setItems(mapItems(order.getItems()));
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        return dto;
    }

    private static BigDecimal calculateTotal(List<OrderItem> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : items) {
            if (item.getPrice() != null && item.getQuantity() != null) {
                total = total.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }
        return total;
    }

    private static List<OrderItemResponse> mapItems(List<OrderItem> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }
        return items.stream().map(OrderItemResponse::from).collect(Collectors.toList());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Order.OrderType getOrderType() {
        return orderType;
    }

    public void setOrderType(Order.OrderType orderType) {
        this.orderType = orderType;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverPhone() {
        return receiverPhone;
    }

    public void setReceiverPhone(String receiverPhone) {
        this.receiverPhone = receiverPhone;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public LocalDateTime getReservationTime() {
        return reservationTime;
    }

    public void setReservationTime(LocalDateTime reservationTime) {
        this.reservationTime = reservationTime;
    }

    public Order.PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(Order.PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Order.OrderStatus getStatus() {
        return status;
    }

    public void setStatus(Order.OrderStatus status) {
        this.status = status;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

}
