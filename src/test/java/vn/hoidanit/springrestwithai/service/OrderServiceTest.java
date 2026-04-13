package vn.hoidanit.springrestwithai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import vn.hoidanit.springrestwithai.model.Order;
import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.model.dto.request.OrderItemRequest;
import vn.hoidanit.springrestwithai.model.dto.request.OrderRequest;
import vn.hoidanit.springrestwithai.repository.OrderRepository;
import vn.hoidanit.springrestwithai.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderService orderService;

    private User buildUser(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setName("Test User");
        return user;
    }

    private OrderItemRequest buildItem(String name, int qty, String price) {
        OrderItemRequest item = new OrderItemRequest();
        item.setProduct(name);
        item.setQuantity(qty);
        item.setPrice(new BigDecimal(price));
        return item;
    }

    private OrderRequest buildRequest(Order.OrderType type) {
        OrderRequest request = new OrderRequest();
        request.setOrderType(type);
        request.setItems(List.of(buildItem("Bun cha", 2, "12.50")));
        if (type == Order.OrderType.DELIVERY) {
            request.setReceiverName("Receiver");
            request.setReceiverPhone("0912000000");
            request.setDeliveryAddress("1 Nguyen Trai");
        } else {
            request.setTableNumber("B1");
        }
        return request;
    }

    @Nested
    @DisplayName("createOrder")
    class CreateOrderTests {

        @Test
        @DisplayName("Sets defaults and assigns user + items")
        void createOrderSetsDefaults() {
            OrderRequest request = buildRequest(Order.OrderType.DINE_IN);
            User user = buildUser(1L, "user@example.com");

            when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
            when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Order result = orderService.createOrder("user@example.com", request);

            assertEquals(Order.OrderStatus.PENDING, result.getStatus());
            assertEquals(Order.PaymentMethod.COD, result.getPaymentMethod());
            assertNotNull(result.getUser());
            assertEquals(1, result.getItems().size());
            assertEquals("Bun cha", result.getItems().get(0).getProduct());
        }

        @Test
        @DisplayName("Throws when items list is empty")
        void createOrderThrowsWhenItemsEmpty() {
            OrderRequest request = buildRequest(Order.OrderType.DELIVERY);
            request.setItems(List.of());

            assertThrows(IllegalArgumentException.class,
                    () -> orderService.createOrder("user@example.com", request));
        }

        @Test
        @DisplayName("Throws when delivery info is missing")
        void createOrderThrowsWhenDeliveryMissingInfo() {
            OrderRequest request = buildRequest(Order.OrderType.DELIVERY);
            request.setReceiverName(null);

            assertThrows(IllegalArgumentException.class,
                    () -> orderService.createOrder("user@example.com", request));
        }

        @Test
        @DisplayName("Throws when dine-in missing table and reservation time")
        void createOrderThrowsWhenDineInMissingInfo() {
            OrderRequest request = buildRequest(Order.OrderType.DINE_IN);
            request.setTableNumber(null);
            request.setReservationTime(null);

            assertThrows(IllegalArgumentException.class,
                    () -> orderService.createOrder("user@example.com", request));
        }
    }

    @Nested
    @DisplayName("getOrderById")
    class GetOrderByIdTests {

        @Test
        @DisplayName("Throws AccessDenied when not owner and not admin")
        void throwsWhenNotOwner() {
            User owner = buildUser(1L, "owner@example.com");
            User other = buildUser(2L, "other@example.com");
            Order order = new Order();
            order.setId(10L);
            order.setUser(owner);

            when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
            when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(other));

            assertThrows(AccessDeniedException.class,
                    () -> orderService.getOrderById(10L, "other@example.com", false));
        }
    }

    @Nested
    @DisplayName("updateStatus")
    class UpdateStatusTests {

        @Test
        @DisplayName("Allows valid transition")
        void allowsValidTransition() {
            Order order = new Order();
            order.setId(1L);
            order.setStatus(Order.OrderStatus.PENDING);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Order result = orderService.updateStatus(1L, Order.OrderStatus.CONFIRMED);

            assertEquals(Order.OrderStatus.CONFIRMED, result.getStatus());
        }

        @Test
        @DisplayName("Rejects invalid transition")
        void rejectsInvalidTransition() {
            Order order = new Order();
            order.setId(1L);
            order.setStatus(Order.OrderStatus.CONFIRMED);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThrows(IllegalArgumentException.class,
                    () -> orderService.updateStatus(1L, Order.OrderStatus.COMPLETED));
        }
    }
}
