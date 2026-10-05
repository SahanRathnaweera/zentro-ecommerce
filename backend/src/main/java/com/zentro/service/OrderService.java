package com.zentro.service;

import com.zentro.dto.OrderItemRequest;
import com.zentro.dto.OrderItemResponse;
import com.zentro.dto.OrderRequest;
import com.zentro.dto.OrderResponse;
import com.zentro.entity.*;
import com.zentro.repository.OrderRepository;
import com.zentro.repository.ProductVariantRepository;
import com.zentro.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductVariantRepository variantRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createOrder(String userEmail, OrderRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        // Merge duplicate variants in the request (same variant twice = add the quantities).
        // TreeMap sorts by id, so locks are always taken in the same order (avoids deadlocks).
        Map<Long, Integer> wanted = new TreeMap<>();
        for (OrderItemRequest item : request.getItems()) {
            wanted.merge(item.getVariantId(), item.getQuantity(), Integer::sum);
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingName(request.getShippingName().trim());
        order.setShippingPhone(request.getShippingPhone().trim());
        order.setShippingAddress(request.getShippingAddress().trim());

        BigDecimal total = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> entry : wanted.entrySet()) {
            ProductVariant variant = variantRepository.findByIdForUpdate(entry.getKey())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Product variant not found: " + entry.getKey()));

            int quantity = entry.getValue();
            Product product = variant.getProduct();

            if (variant.getStock() < quantity) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Not enough stock for " + product.getName() + " (" + variant.getColor()
                                + " / " + variant.getSize() + "). Available: " + variant.getStock());
            }

            // The price comes from the database, never from the client
            BigDecimal unitPrice = product.getDiscountPrice() != null
                    ? product.getDiscountPrice()
                    : product.getPrice();

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariant(variant);
            orderItem.setProductName(product.getName());
            orderItem.setSize(variant.getSize());
            orderItem.setColor(variant.getColor());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setQuantity(quantity);
            order.getItems().add(orderItem);

            // Reduce the stock
            variant.setStock(variant.getStock() - quantity);

            total = total.add(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        }

        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(String userEmail, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));


        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = new ArrayList<>();
        for (OrderItem i : order.getItems()) {
            items.add(new OrderItemResponse(
                    i.getVariant().getId(),
                    i.getProductName(),
                    i.getSize(),
                    i.getColor(),
                    i.getUnitPrice(),
                    i.getQuantity(),
                    i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity()))));
        }
        items.sort(Comparator.comparing(OrderItemResponse::getVariantId));

        return new OrderResponse(
                order.getId(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getShippingName(),
                order.getShippingPhone(),
                order.getShippingAddress(),
                order.getCreatedAt(),
                items);
    }
}
