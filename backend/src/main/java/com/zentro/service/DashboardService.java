package com.zentro.service;

import com.zentro.dto.DashboardResponse;
import com.zentro.dto.RecentOrderResponse;
import com.zentro.entity.OrderStatus;
import com.zentro.entity.Role;
import com.zentro.repository.OrderRepository;
import com.zentro.repository.ProductRepository;
import com.zentro.repository.ProductVariantRepository;
import com.zentro.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private static final int LOW_STOCK_THRESHOLD = 5;

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;

    public DashboardService(ProductRepository productRepository,
                            UserRepository userRepository,
                            OrderRepository orderRepository,
                            ProductVariantRepository variantRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.variantRepository = variantRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        List<RecentOrderResponse> recent = orderRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(o -> new RecentOrderResponse(
                        o.getId(),
                        o.getUser() != null ? o.getUser().getFullName() : o.getShippingName() + " (guest)",
                        o.getStatus().name(),
                        o.getTotalAmount(),
                        o.getCreatedAt()))
                .toList();

        return new DashboardResponse(
                productRepository.count(),
                userRepository.countByRole(Role.ROLE_CUSTOMER),
                orderRepository.count(),
                orderRepository.sumSalesExcluding(OrderStatus.CANCELLED),
                variantRepository.countByStockLessThanEqual(LOW_STOCK_THRESHOLD),
                recent);
    }
}
