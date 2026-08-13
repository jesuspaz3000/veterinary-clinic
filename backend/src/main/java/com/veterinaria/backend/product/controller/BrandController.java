package com.veterinaria.backend.product.controller;

import com.veterinaria.backend.product.dto.BrandDTO;
import com.veterinaria.backend.product.dto.CreateBrandDTO;
import com.veterinaria.backend.product.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCTS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<BrandDTO>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCTS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable UUID id) {
        return ResponseEntity.ok(brandService.getBrandById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCTS_CREATE') or hasAuthority('USERS_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<BrandDTO> createBrand(@Valid @RequestBody CreateBrandDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(brandService.createBrand(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCTS_UPDATE') or hasAuthority('USERS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<BrandDTO> updateBrand(@PathVariable UUID id, @Valid @RequestBody CreateBrandDTO dto) {
        return ResponseEntity.ok(brandService.updateBrand(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCTS_DELETE') or hasAuthority('USERS_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Void> deleteBrand(@PathVariable UUID id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
