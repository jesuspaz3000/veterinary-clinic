package com.veterinaria.backend.product.controller;

import com.veterinaria.backend.product.dto.CategoryDTO;
import com.veterinaria.backend.product.dto.CreateCategoryDTO;
import com.veterinaria.backend.product.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCTS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCTS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCTS_CREATE') or hasAuthority('USERS_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CreateCategoryDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCTS_UPDATE') or hasAuthority('USERS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable UUID id, @Valid @RequestBody CreateCategoryDTO dto) {
        return ResponseEntity.ok(categoryService.updateCategory(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCTS_DELETE') or hasAuthority('USERS_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
