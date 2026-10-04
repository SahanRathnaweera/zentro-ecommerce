package com.zentro.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VariantResponse {

    private Long id;
    private String size;
    private String color;
    private Integer stock;
}
