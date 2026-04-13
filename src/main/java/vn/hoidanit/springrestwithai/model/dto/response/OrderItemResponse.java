package vn.hoidanit.springrestwithai.model.dto.response;

import java.math.BigDecimal;

import vn.hoidanit.springrestwithai.model.OrderItem;

public class OrderItemResponse {

    private Long id;
    private String product;
    private Integer quantity;
    private BigDecimal price;
    private String description;

    public static OrderItemResponse from(OrderItem item) {
        OrderItemResponse dto = new OrderItemResponse();
        dto.setId(item.getId());
        dto.setProduct(item.getProduct());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        dto.setDescription(item.getDescription());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProduct() {
        return product;
    }

    public void setProduct(String product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
