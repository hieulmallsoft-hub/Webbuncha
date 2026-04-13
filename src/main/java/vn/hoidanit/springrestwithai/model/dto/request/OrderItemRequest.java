package vn.hoidanit.springrestwithai.model.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class OrderItemRequest {

    @NotBlank(message = "{order.item.product.notBlank}")
    @Size(max = 255, message = "{order.item.product.size}")
    private String product;

    @NotNull(message = "{order.item.quantity.notNull}")
    @Min(value = 1, message = "{order.item.quantity.min}")
    private Integer quantity;

    @NotNull(message = "{order.item.price.notNull}")
    @DecimalMin(value = "0.01", message = "{order.item.price.min}")
    @Digits(integer = 10, fraction = 2, message = "{order.item.price.digits}")
    private BigDecimal price;

    @Size(max = 255, message = "{order.item.description.size}")
    private String description;

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
