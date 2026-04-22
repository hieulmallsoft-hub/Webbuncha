package vn.hoidanit.springrestwithai.features.orders.infrastructure.persistence;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;

import vn.hoidanit.springrestwithai.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    @EntityGraph(attributePaths = { "user", "items" })
    @Query("select distinct o from Order o left join fetch o.user left join fetch o.items where o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") Long id);
}
