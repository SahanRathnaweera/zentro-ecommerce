package com.zentro.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VariantRequest {
    @NotBlank(message = "Size is required")
    @Size(max = 20, message = "Size must be at most 20 characters")
    private String size;

    @NotBlank(message = "Color is required")
    @Size(max = 30, message = "Color must be at most 30 characters")
    private String color;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;
}
