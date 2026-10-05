package com.zentro.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class DashboardResponse {

    private long totalProducts;
    private long totalCustomers;
    private long totalOrders;
    private BigDecimal totalSales;
    private long lowStockVariants;
    private List<RecentOrderResponse> recentOrders;
}
