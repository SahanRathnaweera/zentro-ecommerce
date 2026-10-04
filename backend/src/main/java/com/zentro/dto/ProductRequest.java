package com.zentro.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 150, message = "Product name must be at most 150 characters")
    private String name;

    private String description;

    @Size(max = 100, message = "Brand must be at most 100 characters")
    private String brand;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", message = "Price cannot be negative")
    private BigDecimal price;

    @DecimalMin(value = "0.00", message = "Discount price cannot be negative")
    private BigDecimal discountPrice;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @Valid
    @NotEmpty(message = "At least one variant is required")
    private List<VariantRequest> variants = new ArrayList<>();

    private List<String> imageUrls = new ArrayList<>();
}
