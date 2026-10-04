package com.zentro.service;

import com.zentro.dto.CategoryRequest;
import com.zentro.dto.CategoryResponse;
import com.zentro.entity.Category;
import com.zentro.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;


    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Category already exists: " + request.getName());
        }
        Category category = new Category(request.getName(), request.getDescription());
        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    // Converts an Entity into a DTO
    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription());
    }
}
