package vn.hoidanit.springrestwithai.service;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import vn.hoidanit.springrestwithai.config.CacheNames;
import vn.hoidanit.springrestwithai.exception.DuplicateResourceException;
import vn.hoidanit.springrestwithai.exception.ResourceNotFoundException;
import vn.hoidanit.springrestwithai.model.Category;
import vn.hoidanit.springrestwithai.model.dto.response.CategoryResponse;
import vn.hoidanit.springrestwithai.repository.CategoryRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Cacheable(cacheNames = CacheNames.CATEGORIES)
    public List<CategoryResponse> getAllCategoryResponses() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Cacheable(cacheNames = CacheNames.CATEGORY_BY_ID, key = "#id")
    public CategoryResponse getCategoryResponseById(Long id) {
        return CategoryResponse.from(getCategoryById(id));
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.CATEGORIES, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.CATEGORY_BY_ID, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.PRODUCTS, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.PRODUCT_BY_ID, allEntries = true)
    })
    public Category createCategory(Category category) {
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new DuplicateResourceException("Category", "name", category.getName());
        }
        return categoryRepository.save(category);
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.CATEGORIES, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.CATEGORY_BY_ID, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.PRODUCTS, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.PRODUCT_BY_ID, allEntries = true)
    })
    public Category updateCategory(Long id, Category update) {
        Category existing = getCategoryById(id);

        if (update.getName() != null) {
            String newName = update.getName();
            if (!newName.equalsIgnoreCase(existing.getName())
                    && categoryRepository.existsByNameIgnoreCase(newName)) {
                throw new DuplicateResourceException("Category", "name", newName);
            }
            existing.setName(newName);
        }
        if (update.getDescription() != null) {
            existing.setDescription(update.getDescription());
        }
        if (update.getImageUrl() != null) {
            existing.setImageUrl(update.getImageUrl());
        }

        return categoryRepository.save(existing);
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.CATEGORIES, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.CATEGORY_BY_ID, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.PRODUCTS, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.PRODUCT_BY_ID, allEntries = true)
    })
    public void deleteCategory(Long id) {
        getCategoryById(id);
        categoryRepository.deleteById(id);
    }
}
