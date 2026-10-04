package com.zentro.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "product_variants",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_variant_product_size_color",
                columnNames = {"product_id", "size", "color"}
        )
)
@Getter
@NoArgsConstructor
public class ProductVariant {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @Setter
    private Product product;

    @Column(nullable = false, length = 20)
    @Setter
    private String size;

    @Column(nullable = false, length = 30)
    @Setter
    private String color;

    @Column(nullable = false)
    @Setter
    private Integer stock;
}
