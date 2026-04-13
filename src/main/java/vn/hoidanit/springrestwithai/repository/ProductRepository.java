package vn.hoidanit.springrestwithai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.hoidanit.springrestwithai.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = "category")
    List<Product> findAll();

    @EntityGraph(attributePaths = "category")
    List<Product> findByCategoryId(Long categoryId);
}
