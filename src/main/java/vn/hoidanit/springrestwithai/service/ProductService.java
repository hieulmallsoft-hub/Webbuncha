package vn.hoidanit.springrestwithai.service;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import vn.hoidanit.springrestwithai.config.CacheNames;
import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.model.Category;
import vn.hoidanit.springrestwithai.model.Product;
import vn.hoidanit.springrestwithai.model.dto.response.ProductResponse;
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

    @Cacheable(cacheNames = CacheNames.PRODUCTS, key = "#categoryId == null ? 'all' : #categoryId")
    public List<ProductResponse> getProductResponses(Long categoryId) {
        return getProducts(categoryId).stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Cacheable(cacheNames = CacheNames.PRODUCT_BY_ID, key = "#id")
    public ProductResponse getProductResponseById(Long id) {
        return ProductResponse.from(getProductById(id));
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

    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.PRODUCTS, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.PRODUCT_BY_ID, allEntries = true)
    })
    public Product createProduct(Product product, Long categoryId) {
        Category category = getCategoryById(categoryId);
        product.setCategory(category);
        return productRepository.save(product);
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.PRODUCTS, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.PRODUCT_BY_ID, allEntries = true)
    })
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

    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.PRODUCTS, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.PRODUCT_BY_ID, allEntries = true)
    })
    public void deleteProduct(Long id) {
        getProductById(id);
        productRepository.deleteById(id);
    }

    private Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }
}
