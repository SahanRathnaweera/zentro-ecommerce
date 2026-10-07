package com.zentro.controller;

import com.zentro.dto.CustomerResponse;
import com.zentro.service.AdminCustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
public class AdminCustomerController {

    private final AdminCustomerService service;

    public AdminCustomerController(AdminCustomerService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getCustomers() {
        return ResponseEntity.ok(service.getCustomers());
    }
}
