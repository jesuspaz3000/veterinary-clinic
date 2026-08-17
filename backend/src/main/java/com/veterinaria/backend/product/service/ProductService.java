package com.veterinaria.backend.product.service;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.product.dto.CreateProductDTO;
import com.veterinaria.backend.product.dto.ProductDTO;
import com.veterinaria.backend.product.dto.ProductRequestDTO;
import com.veterinaria.backend.product.dto.UpdateProductDTO;
import com.veterinaria.backend.user.model.User;

import java.util.UUID;

public interface ProductService {
    PaginatedResponse<ProductDTO> getAllProducts(ProductRequestDTO request);
    ProductDTO getProductById(UUID id);
    ProductDTO createProduct(CreateProductDTO dto, User currentUser);
    ProductDTO createProduct(CreateProductDTO dto);
    ProductDTO updateProduct(UUID id, UpdateProductDTO dto, User currentUser);
    ProductDTO updateProduct(UUID id, UpdateProductDTO dto);
    void deleteProduct(UUID id);
    void reactivateProduct(UUID id);
}
