package com.veterinaria.backend.product.service.Impl;

import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.product.dto.CategoryDTO;
import com.veterinaria.backend.product.dto.CreateCategoryDTO;
import com.veterinaria.backend.product.mapper.CategoryMapper;
import com.veterinaria.backend.product.model.Category;
import com.veterinaria.backend.product.repository.CategoryRepository;
import com.veterinaria.backend.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoría no encontrada con id: " + id));
        return categoryMapper.toDTO(category);
    }

    @Override
    @Transactional
    public CategoryDTO createCategory(CreateCategoryDTO dto) {
        if (categoryRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new ConflictException("Ya existe una categoría con el nombre: " + dto.getName());
        }

        Category category = Category.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .build();

        return categoryMapper.toDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(UUID id, CreateCategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoría no encontrada con id: " + id));

        String newName = dto.getName().trim();
        if (!category.getName().equalsIgnoreCase(newName) && categoryRepository.existsByNameIgnoreCase(newName)) {
            throw new ConflictException("Ya existe otra categoría con el nombre: " + newName);
        }

        category.setName(newName);
        category.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);

        return categoryMapper.toDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new NotFoundException("Categoría no encontrada con id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
