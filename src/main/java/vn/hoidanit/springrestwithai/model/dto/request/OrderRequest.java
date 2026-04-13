package vn.hoidanit.springrestwithai.model.dto.request;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import vn.hoidanit.springrestwithai.model.Order;

public class OrderRequest {

    @NotEmpty(message = "{order.items.notEmpty}")
    @Valid
    private List<OrderItemRequest> items;

    @Size(max = 255, message = "{order.description.size}")
    private String description;

    @NotNull(message = "{order.type.notNull}")
    private Order.OrderType orderType;

    @Size(max = 100, message = "{order.receiverName.size}")
    private String receiverName;

    @Pattern(regexp = "^[0-9+\\- ]{8,20}$", message = "{order.receiverPhone.pattern}")
    private String receiverPhone;

    @Size(max = 255, message = "{order.deliveryAddress.size}")
    private String deliveryAddress;

    @Size(max = 50, message = "{order.tableNumber.size}")
    private String tableNumber;

    private LocalDateTime reservationTime;

    private Order.PaymentMethod paymentMethod;

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
}
