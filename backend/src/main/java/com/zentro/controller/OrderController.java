package com.zentro.controller;

import com.zentro.dto.OrderRequest;
import com.zentro.dto.OrderResponse;
import com.zentro.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // POST /api/orders  (login required; user is taken from the token)
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request,
                                                     Authentication authentication) {
        OrderResponse created = orderService.createOrder(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET /api/orders
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getMyOrders(authentication.getName()));
    }

    // GET /api/orders/5
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getMyOrder(@PathVariable Long id,
                                                    Authentication authentication) {
        return ResponseEntity.ok(orderService.getMyOrder(authentication.getName(), id));
    }
}
