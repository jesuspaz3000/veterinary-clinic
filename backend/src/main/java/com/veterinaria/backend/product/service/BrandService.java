package com.veterinaria.backend.product.service;

import com.veterinaria.backend.product.dto.BrandDTO;
import com.veterinaria.backend.product.dto.CreateBrandDTO;

import java.util.List;
import java.util.UUID;

public interface BrandService {
    List<BrandDTO> getAllBrands();
    BrandDTO getBrandById(UUID id);
    BrandDTO createBrand(CreateBrandDTO dto);
    BrandDTO updateBrand(UUID id, CreateBrandDTO dto);
    void deleteBrand(UUID id);
}
