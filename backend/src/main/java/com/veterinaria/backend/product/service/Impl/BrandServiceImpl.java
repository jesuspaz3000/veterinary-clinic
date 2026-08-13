package com.veterinaria.backend.product.service.Impl;

import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.product.dto.BrandDTO;
import com.veterinaria.backend.product.dto.CreateBrandDTO;
import com.veterinaria.backend.product.mapper.BrandMapper;
import com.veterinaria.backend.product.model.Brand;
import com.veterinaria.backend.product.repository.BrandRepository;
import com.veterinaria.backend.product.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(brandMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BrandDTO getBrandById(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Marca no encontrada con id: " + id));
        return brandMapper.toDTO(brand);
    }

    @Override
    @Transactional
    public BrandDTO createBrand(CreateBrandDTO dto) {
        if (brandRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new ConflictException("Ya existe una marca con el nombre: " + dto.getName());
        }

        Brand brand = Brand.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .build();

        return brandMapper.toDTO(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandDTO updateBrand(UUID id, CreateBrandDTO dto) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Marca no encontrada con id: " + id));

        String newName = dto.getName().trim();
        if (!brand.getName().equalsIgnoreCase(newName) && brandRepository.existsByNameIgnoreCase(newName)) {
            throw new ConflictException("Ya existe otra marca con el nombre: " + newName);
        }

        brand.setName(newName);
        brand.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);

        return brandMapper.toDTO(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public void deleteBrand(UUID id) {
        if (!brandRepository.existsById(id)) {
            throw new NotFoundException("Marca no encontrada con id: " + id);
        }
        brandRepository.deleteById(id);
    }
}
