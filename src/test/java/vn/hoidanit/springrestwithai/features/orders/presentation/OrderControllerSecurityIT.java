package vn.hoidanit.springrestwithai.features.orders.presentation;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import vn.hoidanit.springrestwithai.model.Order;
import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.features.orders.infrastructure.persistence.OrderRepository;
import vn.hoidanit.springrestwithai.features.users.infrastructure.persistence.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
class OrderControllerSecurityIT {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        orderRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User saveUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setName("Test User");
        user.setPassword("encoded-password");
        return userRepository.save(user);
    }

    private Order saveOrder(User owner) {
        Order order = new Order();
        order.setUser(owner);
        order.setOrderType(Order.OrderType.DELIVERY);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        return orderRepository.save(order);
    }

    @Test
    @WithMockUser(username = "owner@example.com", roles = "USER")
    void getOrderById_allowsOwner() throws Exception {
        User owner = saveUser("owner@example.com");
        Order order = saveOrder(owner);

        mockMvc.perform(get("/orders/" + order.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "other@example.com", roles = "USER")
    void getOrderById_deniesOtherUser() throws Exception {
        User other = saveUser("other@example.com");
        User owner = saveUser("owner@example.com");
        Order order = saveOrder(owner);

        mockMvc.perform(get("/orders/" + order.getId()))
                .andExpect(status().isForbidden());
    }
}
