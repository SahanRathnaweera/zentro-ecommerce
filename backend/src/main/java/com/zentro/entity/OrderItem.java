package com.zentro.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@NoArgsConstructor
public class OrderItem {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    @Setter
    private Order order;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    @Setter
    private ProductVariant variant;


    @Column(name = "product_name", nullable = false, length = 150)
    @Setter
    private String productName;

    @Column(nullable = false, length = 20)
    @Setter
    private String size;

    @Column(nullable = false, length = 30)
    @Setter
    private String color;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    @Setter
    private BigDecimal unitPrice;

    @Column(nullable = false)
    @Setter
    private Integer quantity;
}
