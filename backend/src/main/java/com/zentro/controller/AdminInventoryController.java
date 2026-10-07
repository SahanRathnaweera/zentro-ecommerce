package com.zentro.controller;

import com.zentro.dto.InventoryItemResponse;
import com.zentro.dto.StockUpdateRequest;
import com.zentro.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
public class AdminInventoryController {

    private final InventoryService service;

    public AdminInventoryController(InventoryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<InventoryItemResponse>> getInventory() {
        return ResponseEntity.ok(service.getInventory());
    }

    @PutMapping("/{variantId}")
    public ResponseEntity<InventoryItemResponse> updateStock(@PathVariable Long variantId,
                                                             @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(service.updateStock(variantId, request.getStock()));
    }
}
