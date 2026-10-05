package com.zentro.repository;

import com.zentro.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository  extends JpaRepository<OrderItem, Long> {
    boolean existsByVariantProductId(Long productId);
}
