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
import com.zentro.repository.OrderItemRepository;
import com.zentro.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderItemRepository orderItemRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          OrderItemRepository orderItemRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderItemRepository = orderItemRepository;
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
        return toResponse(findProduct(id));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = findCategory(request.getCategoryId());
        validateRequest(request);

        Product product = new Product();
        applyBasicFields(product, request, category);

        for (VariantRequest v : request.getVariants()) {
            product.getVariants().add(newVariant(product, v));
        }
        replaceImages(product, request.getImageUrls());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProduct(id);
        Category category = findCategory(request.getCategoryId());
        validateRequest(request);

        applyBasicFields(product, request, category);


        Map<String, ProductVariant> existing = new HashMap<>();
        for (ProductVariant v : product.getVariants()) {
            existing.put(key(v.getSize(), v.getColor()), v);
        }

        Set<String> requested = new HashSet<>();
        for (VariantRequest v : request.getVariants()) {
            String k = key(v.getSize(), v.getColor());
            requested.add(k);
            ProductVariant current = existing.get(k);
            if (current != null) {
                current.setStock(v.getStock());
            } else {
                product.getVariants().add(newVariant(product, v));
            }
        }

        for (ProductVariant v : List.copyOf(product.getVariants())) {
            if (v.getId() != null && !requested.contains(key(v.getSize(), v.getColor()))) {
                v.setStock(0);
            }
        }

        replaceImages(product, request.getImageUrls());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProduct(id);

        if (orderItemRepository.existsByVariantProductId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This product is part of existing orders and cannot be deleted. "
                            + "Set its stock to 0 instead.");
        }

        productRepository.delete(product);
    }

    // ---------- helpers ----------

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found: " + id));
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found: " + id));
    }

    private void validateRequest(ProductRequest request) {
        if (request.getDiscountPrice() != null
                && request.getDiscountPrice().compareTo(request.getPrice()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Discount price cannot be higher than the price");
        }

        Set<String> seen = new HashSet<>();
        for (VariantRequest v : request.getVariants()) {
            if (!seen.add(key(v.getSize(), v.getColor()))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Duplicate variant: " + v.getSize() + " / " + v.getColor());
            }
        }
    }

    private void applyBasicFields(Product product, ProductRequest request, Category category) {
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setCategory(category);
    }

    private ProductVariant newVariant(Product product, VariantRequest v) {
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSize(v.getSize().trim());
        variant.setColor(v.getColor().trim());
        variant.setStock(v.getStock());
        return variant;
    }

    private void replaceImages(Product product, List<String> urls) {
        product.getImages().clear();
        boolean first = true;
        for (String url : urls) {
            if (url == null || url.isBlank()) continue;
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl(url.trim());
            image.setPrimary(first);
            first = false;
            product.getImages().add(image);
        }
    }

    private String key(String size, String color) {
        return size.trim().toLowerCase() + "|" + color.trim().toLowerCase();
    }

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