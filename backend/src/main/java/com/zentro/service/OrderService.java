package com.zentro.service;

import com.zentro.dto.OrderItemRequest;
import com.zentro.dto.OrderItemResponse;
import com.zentro.dto.OrderRequest;
import com.zentro.dto.OrderResponse;
import com.zentro.entity.Order;
import com.zentro.entity.OrderItem;
import com.zentro.entity.PaymentMethod;
import com.zentro.entity.Product;
import com.zentro.entity.ProductVariant;
import com.zentro.entity.User;
import com.zentro.repository.OrderRepository;
import com.zentro.repository.ProductVariantRepository;
import com.zentro.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

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

    // userEmail is null for guest orders
    @Transactional
    public OrderResponse createOrder(String userEmail, OrderRequest request) {
        User user = null;
        if (userEmail != null) {
            user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        }

        // Merge duplicate variants (TreeMap = locks always taken in the same order)
        Map<Long, Integer> wanted = new TreeMap<>();
        for (OrderItemRequest item : request.getItems()) {
            wanted.merge(item.getVariantId(), item.getQuantity(), Integer::sum);
        }

        Order order = new Order();
        order.setUser(user);
        order.setContactEmail(request.getContactEmail().trim().toLowerCase());
        order.setPaymentMethod(request.getPaymentMethod() == null
                ? PaymentMethod.COD : request.getPaymentMethod());
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

        // Guest orders have no user, so they never match
        if (order.getUser() == null || !order.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return toResponse(order);
    }

    // Guest tracking: the order id AND the email must both match
    @Transactional(readOnly = true)
    public OrderResponse trackOrder(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getContactEmail().equalsIgnoreCase(email.trim())) {
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
                order.getContactEmail(),
                order.getShippingName(),
                order.getShippingPhone(),
                order.getShippingAddress(),
                order.getCreatedAt(),
                items,
                order.getPaymentMethod().name(),
                order.getPaymentStatus().name());
    }
}