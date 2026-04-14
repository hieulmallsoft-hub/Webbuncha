package vn.hoidanit.springrestwithai.controller;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.hoidanit.springrestwithai.helper.ApiResponse;
import vn.hoidanit.springrestwithai.model.User;
import vn.hoidanit.springrestwithai.model.dto.request.UserCreateRequest;
import vn.hoidanit.springrestwithai.model.dto.request.UserUpdateRequest;
import vn.hoidanit.springrestwithai.model.dto.response.UserResponse;
import vn.hoidanit.springrestwithai.service.UserService;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/health")
    public ResponseEntity<String> getHomePage() {
        return ResponseEntity.ok("OK");
    }

    // GET /users - lay tat ca users
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN mới được xem danh sách người dùng
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<User> users = this.userService.getAllUsers();
        List<UserResponse> responses = users.stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach nguoi dung thanh cong", responses));
    }

    // GET /users/{id} - lay user theo id
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id,
            Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ADMIN");
        String requester = authentication != null ? authentication.getName() : null;
        this.userService.assertOwnerOrAdmin(id, requester, isAdmin);
        User user = this.userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Lay thong tin nguoi dung thanh cong", UserResponse.from(user)));
    }

    // POST /users - tao user moi
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        User user = request.toUser();

        User createdUser = this.userService.createUser(user);
        URI location = URI.create("/users/" + createdUser.getId());
        return ResponseEntity.created(location)
                .body(ApiResponse.created("Tao nguoi dung moi thanh cong", UserResponse.from(createdUser)));
    }

    // PUT /users/{id} - cap nhat user
    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ADMIN");
        String requester = authentication != null ? authentication.getName() : null;
        this.userService.assertOwnerOrAdmin(id, requester, isAdmin);

        User user = request.toUser();

        User updatedUser = this.userService.updateUser(id, user);
        return ResponseEntity.ok(ApiResponse.success("Cap nhat thong tin nguoi dung thanh cong",
                UserResponse.from(updatedUser)));
    }

    // DELETE /users/{id} - xoa user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id,
            Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ADMIN");
        String requester = authentication != null ? authentication.getName() : null;
        this.userService.assertOwnerOrAdmin(id, requester, isAdmin);
        this.userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    private boolean hasRole(Authentication authentication, String role) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        String normalized = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> role.equals(authority.getAuthority())
                        || normalized.equals(authority.getAuthority()));
    }
}
