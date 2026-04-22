package vn.hoidanit.springrestwithai.features.orders.infrastructure.persistence;

import java.time.Instant;

import org.springframework.data.jpa.domain.Specification;

import vn.hoidanit.springrestwithai.model.Order;

public final class OrderSpecifications {

    private OrderSpecifications() {
    }

    public static Specification<Order> hasUserId(Long userId) {
        return (root, query, cb) -> userId == null ? cb.conjunction()
                : cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Order> hasStatus(Order.OrderStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    public static Specification<Order> hasOrderType(Order.OrderType orderType) {
        return (root, query, cb) -> orderType == null ? cb.conjunction()
                : cb.equal(root.get("orderType"), orderType);
    }

    public static Specification<Order> hasPaymentMethod(Order.PaymentMethod paymentMethod) {
        return (root, query, cb) -> paymentMethod == null ? cb.conjunction()
                : cb.equal(root.get("paymentMethod"), paymentMethod);
    }

    public static Specification<Order> createdAtFrom(Instant from) {
        return (root, query, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("createdAt"), from);
    }

    public static Specification<Order> createdAtTo(Instant to) {
        return (root, query, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("createdAt"), to);
    }
}
