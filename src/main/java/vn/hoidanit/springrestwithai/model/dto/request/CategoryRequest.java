package vn.hoidanit.springrestwithai.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import vn.hoidanit.springrestwithai.model.Category;

public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 255, message = "Category name must be <= 255 chars")
    private String name;

    @Size(max = 255, message = "Description must be <= 255 chars")
    private String description;

    @Size(max = 255, message = "Image URL must be <= 255 chars")
    private String imageUrl;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Category toCategory() {
        Category category = new Category();
        category.setName(this.name);
        category.setDescription(this.description);
        category.setImageUrl(this.imageUrl);
        return category;
    }
}
