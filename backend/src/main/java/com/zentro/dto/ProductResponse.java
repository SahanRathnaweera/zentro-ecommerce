package com.zentro.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private String brand;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Long categoryId;
    private String categoryName;
    private int totalStock;
    private List<VariantResponse> variants;
    private List<String> imageUrls;
}
