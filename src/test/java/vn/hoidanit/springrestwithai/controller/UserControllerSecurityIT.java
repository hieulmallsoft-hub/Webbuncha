package vn.hoidanit.springrestwithai.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.repository.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
class UserControllerSecurityIT {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        userRepository.deleteAll();
    }

    private User saveUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setName("Test User");
        user.setPassword("encoded-password");
        return userRepository.save(user);
    }

    @Test
    @WithMockUser(username = "owner@example.com", roles = "USER")
    void getUserById_allowsOwner() throws Exception {
        User owner = saveUser("owner@example.com");

        mockMvc.perform(get("/users/" + owner.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "other@example.com", roles = "USER")
    void getUserById_deniesOtherUser() throws Exception {
        saveUser("other@example.com");
        User owner = saveUser("owner@example.com");

        mockMvc.perform(get("/users/" + owner.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void listUsers_requiresAdmin() throws Exception {
        mockMvc.perform(get("/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void createUser_requiresAdmin() throws Exception {
        String payload = """
                {
                  "email": "new@example.com",
                  "name": "New User",
                  "password": "Password1",
                  "age": 20,
                  "address": "HN"
                }
                """;

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isForbidden());
    }
}
