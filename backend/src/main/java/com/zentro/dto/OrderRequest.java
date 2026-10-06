package com.zentro.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class OrderRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 150, message = "Email must be at most 150 characters")
    private String contactEmail;

    @NotBlank(message = "Shipping name is required")
    @Size(max = 100, message = "Shipping name must be at most 100 characters")
    private String shippingName;

    @NotBlank(message = "Shipping phone is required")
    @Size(max = 20, message = "Shipping phone must be at most 20 characters")
    private String shippingPhone;

    @NotBlank(message = "Shipping address is required")
    @Size(max = 300, message = "Shipping address must be at most 300 characters")
    private String shippingAddress;

    @Valid
    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemRequest> items = new ArrayList<>();
}