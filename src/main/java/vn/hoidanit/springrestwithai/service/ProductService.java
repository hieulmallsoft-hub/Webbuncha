package vn.hoidanit.springrestwithai.service;

import java.util.List;

import org.springframework.stereotype.Service;

import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.model.Category;
import vn.hoidanit.springrestwithai.model.Product;
import vn.hoidanit.springrestwithai.repository.CategoryRepository;
import vn.hoidanit.springrestwithai.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Product> getProducts(Long categoryId) {
        if (categoryId == null) {
            return productRepository.findAll();
        }
        return productRepository.findByCategoryId(categoryId);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    public Product createProduct(Product product, Long categoryId) {
        Category category = getCategoryById(categoryId);
        product.setCategory(category);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product update, Long categoryId) {
        Product existing = getProductById(id);

        if (update.getName() != null) {
            existing.setName(update.getName());
        }
        if (update.getDescription() != null) {
            existing.setDescription(update.getDescription());
        }
        if (update.getPrice() != null) {
            existing.setPrice(update.getPrice());
        }
        if (update.getImageUrl() != null) {
            existing.setImageUrl(update.getImageUrl());
        }
        if (categoryId != null) {
            Category category = getCategoryById(categoryId);
            existing.setCategory(category);
        }

        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        getProductById(id);
        productRepository.deleteById(id);
    }

    private Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }
}
