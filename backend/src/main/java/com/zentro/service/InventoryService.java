package com.zentro.service;

import com.zentro.dto.InventoryItemResponse;
import com.zentro.entity.ProductVariant;
import com.zentro.repository.ProductVariantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class InventoryService {


    private final ProductVariantRepository variantRepository;

    public InventoryService(ProductVariantRepository variantRepository) {
        this.variantRepository = variantRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getInventory() {
        return variantRepository.findAllByOrderByProductNameAscColorAscSizeAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    // Row is locked so it cannot clash with a customer checking out at the same moment
    @Transactional
    public InventoryItemResponse updateStock(Long variantId, int stock) {
        ProductVariant variant = variantRepository.findByIdForUpdate(variantId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Variant not found: " + variantId));
        variant.setStock(stock);
        return toResponse(variant);
    }

    private InventoryItemResponse toResponse(ProductVariant v) {
        return new InventoryItemResponse(
                v.getId(),
                v.getProduct().getId(),
                v.getProduct().getName(),
                v.getProduct().getCategory().getName(),
                v.getSize(),
                v.getColor(),
                v.getStock());
    }
}
