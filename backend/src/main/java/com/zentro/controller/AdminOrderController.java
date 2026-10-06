package com.zentro.controller;

import com.zentro.dto.AdminOrderResponse;
import com.zentro.dto.StatusUpdateRequest;
import com.zentro.service.AdminOrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    @GetMapping
    public ResponseEntity<List<AdminOrderResponse>> getAllOrders() {
        return ResponseEntity.ok(adminOrderService.getAllOrders());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AdminOrderResponse> updateStatus(@PathVariable Long id,
                                                           @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(adminOrderService.updateStatus(id, request.getStatus()));
    }
}
