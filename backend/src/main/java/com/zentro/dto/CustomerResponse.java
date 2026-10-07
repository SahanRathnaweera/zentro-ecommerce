package com.zentro.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CustomerResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private LocalDateTime registeredAt;
    private long orderCount;
    private BigDecimal totalSpent;
}
