package vn.hoidanit.springrestwithai.features.payments.vnpay.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import vn.hoidanit.springrestwithai.features.orders.application.OrderService;
import vn.hoidanit.springrestwithai.features.payments.vnpay.infrastructure.config.VnpayProperties;
import vn.hoidanit.springrestwithai.model.Order;
import vn.hoidanit.springrestwithai.model.OrderItem;
import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.features.payments.vnpay.model.VnpayPaymentResponse;

@ExtendWith(MockitoExtension.class)
class VnpayServiceTest {

    @Mock
    private OrderService orderService;

    private VnpayProperties properties;
    private VnpayService vnpayService;

    @BeforeEach
    void setUp() {
        properties = new VnpayProperties();
        properties.setEnabled(true);
        properties.setTmnCode("N3PJHBNO");
        properties.setHashSecret("I5J3VWK2Y6J4I9UO7F7YPB4J9VZK1WXC");
        properties.setPaymentUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        properties.setReturnUrl("http://localhost:5173/payment-result");
        properties.setIpnUrl("http://localhost:8080/payments/vnpay/ipn");

        vnpayService = new VnpayService(properties, orderService);
    }

    @Test
    void createPaymentUrlAddsDeliveryFeeAndConvertsUnitsToVnd() {
        Order order = buildOrder(33L, Order.OrderType.DELIVERY);
        when(orderService.getAccessibleOrder(33L, "user@example.com", false)).thenReturn(order);

        VnpayPaymentResponse response = vnpayService.createPaymentUrl(33L, "user@example.com", false, "127.0.0.1");

        assertEquals(155_000L, response.getAmount());
        assertTrue(response.getPaymentUrl().contains("vnp_Amount=15500000"));
        assertTrue(response.getPaymentUrl().contains("vnp_TmnCode=N3PJHBNO"));
    }

    @Test
    void createPaymentUrlDoesNotAddDeliveryFeeForDineIn() {
        Order order = buildOrder(34L, Order.OrderType.DINE_IN);
        when(orderService.getAccessibleOrder(34L, "user@example.com", false)).thenReturn(order);

        VnpayPaymentResponse response = vnpayService.createPaymentUrl(34L, "user@example.com", false, "127.0.0.1");

        assertEquals(130_000L, response.getAmount());
        assertTrue(response.getPaymentUrl().contains("vnp_Amount=13000000"));
    }

    private Order buildOrder(Long id, Order.OrderType orderType) {
        Order order = new Order();
        order.setId(id);
        order.setOrderType(orderType);
        order.setPaymentMethod(Order.PaymentMethod.VNPAY);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setUser(new User());

        OrderItem first = new OrderItem();
        first.setProduct("Bun cha vien");
        first.setQuantity(1);
        first.setPrice(BigDecimal.valueOf(6));

        OrderItem second = new OrderItem();
        second.setProduct("Bun cha lan");
        second.setQuantity(1);
        second.setPrice(BigDecimal.valueOf(7));

        first.setOrder(order);
        second.setOrder(order);
        order.setItems(List.of(first, second));
        return order;
    }
}
