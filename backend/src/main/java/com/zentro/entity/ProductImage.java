package com.zentro.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_images")
@Getter
@NoArgsConstructor
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @Setter
    private Product product;

    @Column(name = "image_url", nullable = false, length = 500)
    @Setter
    private String imageUrl;

    @Column(name = "is_primary", nullable = false)
    @Setter
    private Boolean primary = false;
}
