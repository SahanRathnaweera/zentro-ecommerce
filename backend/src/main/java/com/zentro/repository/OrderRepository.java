package com.zentro.repository;

import com.zentro.entity.Order;
import com.zentro.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findTop5ByOrderByCreatedAtDesc();

    List<Order> findAllByOrderByCreatedAtDesc();


    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.status <> :excluded")
    BigDecimal sumSalesExcluding(OrderStatus excluded);
}