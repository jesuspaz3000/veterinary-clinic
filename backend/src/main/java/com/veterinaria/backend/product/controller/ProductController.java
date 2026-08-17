package com.veterinaria.backend.product.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.product.dto.CreateProductDTO;
import com.veterinaria.backend.product.dto.ProductDTO;
import com.veterinaria.backend.product.dto.ProductRequestDTO;
import com.veterinaria.backend.product.dto.UpdateProductDTO;
import com.veterinaria.backend.product.service.ProductService;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product and Inventory management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCTS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get products paginated", description = "Get list of products with filters")
    public ResponseEntity<PaginatedResponse<ProductDTO>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID brandId,
            @RequestParam(required = false) String targetSpecies,
            @RequestParam(required = false) Boolean requiresPrescription,
            @RequestParam(required = false) Boolean isLowStock,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset
    ) {
        ProductRequestDTO request = ProductRequestDTO.builder()
                .search(search)
                .categoryId(categoryId)
                .brandId(brandId)
                .targetSpecies(targetSpecies)
                .requiresPrescription(requiresPrescription)
                .isLowStock(isLowStock)
                .status(status)
                .limit(limit)
                .offset(offset)
                .build();

        return ResponseEntity.ok(productService.getAllProducts(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCTS_READ') or hasAuthority('USERS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get product by ID", description = "Get details of a specific product")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE })
    @PreAuthorize("hasAuthority('PRODUCTS_CREATE') or hasAuthority('USERS_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Create product", description = "Register a new product with variants")
    public ResponseEntity<ProductDTO> createProduct(@Valid @ModelAttribute CreateProductDTO dto, Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(dto, currentUser));
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE })
    @PreAuthorize("hasAuthority('PRODUCTS_UPDATE') or hasAuthority('USERS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Update product", description = "Update details of an existing product")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable UUID id, @Valid @ModelAttribute UpdateProductDTO dto, Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(productService.updateProduct(id, dto, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCTS_DELETE') or hasAuthority('USERS_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Delete product", description = "Deactivate product and its variants")
    public ResponseEntity<MessageResponse> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new MessageResponse("Producto desactivado exitosamente"));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAuthority('PRODUCTS_UPDATE') or hasAuthority('USERS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Reactivate product", description = "Reactivate a previously deactivated product and its variants")
    public ResponseEntity<MessageResponse> reactivateProduct(@PathVariable UUID id) {
        productService.reactivateProduct(id);
        return ResponseEntity.ok(new MessageResponse("Producto reactivado exitosamente"));
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        String principal = authentication.getName();
        return userRepository.findByEmail(principal)
                .or(() -> userRepository.findByUsername(principal))
                .orElse(null);
    }
}
