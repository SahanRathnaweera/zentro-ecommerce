package com.zentro.service;

import com.zentro.dto.ProductRequest;
import com.zentro.dto.ProductResponse;
import com.zentro.dto.VariantRequest;
import com.zentro.dto.VariantResponse;
import com.zentro.entity.Category;
import com.zentro.entity.Product;
import com.zentro.entity.ProductImage;
import com.zentro.entity.ProductVariant;
import com.zentro.repository.CategoryRepository;
import com.zentro.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts(Long categoryId) {
        List<Product> products = (categoryId == null)
                ? productRepository.findAll()
                : productRepository.findByCategoryId(categoryId);

        return products.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found: " + id));
        return toResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found: " + request.getCategoryId()));

        if (request.getDiscountPrice() != null
                && request.getDiscountPrice().compareTo(request.getPrice()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Discount price cannot be higher than the price");
        }

        // Reject duplicate size+color combinations in the same request
        Set<String> seen = new HashSet<>();
        for (VariantRequest v : request.getVariants()) {
            String key = v.getSize().trim().toLowerCase() + "|" + v.getColor().trim().toLowerCase();
            if (!seen.add(key)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Duplicate variant: " + v.getSize() + " / " + v.getColor());
            }
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setCategory(category);

        for (VariantRequest v : request.getVariants()) {
            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setSize(v.getSize().trim());
            variant.setColor(v.getColor().trim());
            variant.setStock(v.getStock());
            product.getVariants().add(variant);
        }

        boolean first = true;
        for (String url : request.getImageUrls()) {
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl(url);
            image.setPrimary(first); // the first image is the primary one
            first = false;
            product.getImages().add(image);
        }

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    // Entity -> DTO
    private ProductResponse toResponse(Product product) {
        List<VariantResponse> variants = product.getVariants().stream()
                .map(v -> new VariantResponse(v.getId(), v.getSize(), v.getColor(), v.getStock()))
                .toList();

        int totalStock = product.getVariants().stream()
                .mapToInt(ProductVariant::getStock)
                .sum();

        List<String> imageUrls = product.getImages().stream()
                .map(ProductImage::getImageUrl)
                .toList();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getBrand(),
                product.getPrice(),
                product.getDiscountPrice(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                totalStock,
                variants,
                imageUrls);
    }
}
