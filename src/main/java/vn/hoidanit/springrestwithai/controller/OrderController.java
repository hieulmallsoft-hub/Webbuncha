package vn.hoidanit.springrestwithai.controller;

import java.net.URI;
import java.time.Instant;
import java.time.OffsetDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.hoidanit.springrestwithai.helper.ApiResponse;
import vn.hoidanit.springrestwithai.model.Order;
import vn.hoidanit.springrestwithai.model.dto.request.OrderRequest;
import vn.hoidanit.springrestwithai.model.dto.response.OrderResponse;
import vn.hoidanit.springrestwithai.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) Order.OrderStatus status,
            @RequestParam(required = false) Order.OrderType orderType,
            @RequestParam(required = false) Order.PaymentMethod paymentMethod,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {

        boolean isAdmin = hasRole(authentication, "ADMIN");
        Instant fromInstant = from != null ? from.toInstant() : null;
        Instant toInstant = to != null ? to.toInstant() : null;

        Page<OrderResponse> responses = this.orderService
                .getOrders(authentication.getName(), isAdmin, userId, status, orderType, paymentMethod,
                        fromInstant, toInstant, pageable)
                .map(OrderResponse::from);

        return ResponseEntity.ok(ApiResponse.success("Lay danh sach don hang thanh cong", responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id,
            Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ADMIN");
        Order order = this.orderService.getOrderById(id, authentication.getName(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Lay thong tin don hang thanh cong", OrderResponse.from(order)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request,
            Authentication authentication) {
        Order createdOrder = this.orderService.createOrder(authentication.getName(), request);
        URI location = URI.create("/orders/" + createdOrder.getId());
        return ResponseEntity.created(location)
                .body(ApiResponse.created("Tao don hang thanh cong", OrderResponse.from(createdOrder)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(@PathVariable Long id,
            @Valid @RequestBody OrderRequest request,
            Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ADMIN");
        Order updatedOrder = this.orderService.updateOrder(id, request, authentication.getName(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Cap nhat don hang thanh cong",
                OrderResponse.from(updatedOrder)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(@PathVariable Long id,
            @RequestParam Order.OrderStatus status) {
        Order updatedOrder = this.orderService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cap nhat trang thai don hang thanh cong",
                OrderResponse.from(updatedOrder)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        this.orderService.deleteOrder(id);
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
