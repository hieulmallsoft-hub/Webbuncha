package vn.hoidanit.springrestwithai.controller;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.hoidanit.springrestwithai.helper.ApiResponse;
import vn.hoidanit.springrestwithai.model.Product;
import vn.hoidanit.springrestwithai.model.dto.request.ProductRequest;
import vn.hoidanit.springrestwithai.model.dto.response.ProductResponse;
import vn.hoidanit.springrestwithai.service.ProductService;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProducts(
            @RequestParam(required = false) Long categoryId) {
        List<ProductResponse> responses = productService.getProducts(categoryId).stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Get products success", responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Get product success", ProductResponse.from(product)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        Product created = productService.createProduct(request.toProduct(), request.getCategoryId());
        URI location = URI.create("/products/" + created.getId());
        return ResponseEntity.created(location)
                .body(ApiResponse.created("Create product success", ProductResponse.from(created)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(@PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        Product updated = productService.updateProduct(id, request.toProduct(), request.getCategoryId());
        return ResponseEntity.ok(ApiResponse.success("Update product success", ProductResponse.from(updated)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
