package com.veterinaria.backend.product.service;

import com.veterinaria.backend.product.dto.CategoryDTO;
import com.veterinaria.backend.product.dto.CreateCategoryDTO;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<CategoryDTO> getAllCategories();
    CategoryDTO getCategoryById(UUID id);
    CategoryDTO createCategory(CreateCategoryDTO dto);
    CategoryDTO updateCategory(UUID id, CreateCategoryDTO dto);
    void deleteCategory(UUID id);
}
