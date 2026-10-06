package com.zentro.controller;

import com.zentro.dto.OrderRequest;
import com.zentro.dto.OrderResponse;
import com.zentro.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Public: logged-in customers AND guests (guest has no token, so authentication is null)
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request,
                                                     Authentication authentication) {
        String email = authentication == null ? null : authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(email, request));
    }

    // Public: guest tracking needs the order id AND the email
    @GetMapping("/track")
    public ResponseEntity<OrderResponse> track(@RequestParam Long id, @RequestParam String email) {
        return ResponseEntity.ok(orderService.trackOrder(id, email));
    }

    // Login required
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getMyOrders(authentication.getName()));
    }

    // Login required
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getMyOrder(@PathVariable Long id,
                                                    Authentication authentication) {
        return ResponseEntity.ok(orderService.getMyOrder(authentication.getName(), id));
    }
}