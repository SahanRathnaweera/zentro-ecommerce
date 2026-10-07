package com.zentro.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InventoryItemResponse {
    private Long variantId;
    private Long productId;
    private String productName;
    private String categoryName;
    private String size;
    private String color;
    private Integer stock;

}
