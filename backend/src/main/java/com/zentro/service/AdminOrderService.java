package com.zentro.service;

import com.zentro.dto.AdminOrderResponse;
import com.zentro.dto.OrderItemResponse;
import com.zentro.entity.Order;
import com.zentro.entity.OrderItem;
import com.zentro.entity.OrderStatus;
import com.zentro.entity.ProductVariant;
import com.zentro.repository.OrderRepository;
import com.zentro.repository.ProductVariantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

@Service
public class AdminOrderService {
    private static final Map<OrderStatus, EnumSet<OrderStatus>> ALLOWED = Map.of(
            OrderStatus.PENDING, EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
            OrderStatus.PROCESSING, EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.SHIPPED, EnumSet.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class));

    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;

    public AdminOrderService(OrderRepository orderRepository,
                             ProductVariantRepository variantRepository) {
        this.orderRepository = orderRepository;
        this.variantRepository = variantRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public AdminOrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        OrderStatus current = order.getStatus();
        if (!ALLOWED.get(current).contains(newStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot change an order from " + current + " to " + newStatus);
        }

        // Cancelling gives the stock back
        if (newStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                ProductVariant variant = variantRepository.findByIdForUpdate(item.getVariant().getId())
                        .orElseThrow();
                variant.setStock(variant.getStock() + item.getQuantity());
            }
        }

        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    private AdminOrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getVariant().getId(), i.getProductName(), i.getSize(), i.getColor(),
                        i.getUnitPrice(), i.getQuantity(),
                        i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity()))))
                .sorted(Comparator.comparing(OrderItemResponse::getVariantId))
                .toList();

        return new AdminOrderResponse(
                order.getId(),
                order.getUser() != null ? order.getUser().getFullName() : order.getShippingName() + " (guest)",
                order.getContactEmail(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getShippingName(),
                order.getShippingPhone(),
                order.getShippingAddress(),
                order.getCreatedAt(),
                items);
    }
}
