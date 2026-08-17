package com.veterinaria.backend.product.service.Impl;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.common.storage.StorageFolder;
import com.veterinaria.backend.common.storage.StorageService;
import com.veterinaria.backend.product.dto.*;
import com.veterinaria.backend.product.mapper.ProductMapper;
import com.veterinaria.backend.product.model.*;
import com.veterinaria.backend.product.repository.*;
import com.veterinaria.backend.product.service.ProductService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.veterinaria.backend.sales.model.InventoryMovement;
import com.veterinaria.backend.sales.repository.InventoryMovementRepository;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryLotRepository lotRepository;
    private final InventoryMovementRepository movementRepository;
    private final ProductMapper productMapper;
    private final StorageService storageService;

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<ProductDTO> getAllProducts(ProductRequestDTO request) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getSearch() != null && !request.getSearch().trim().isEmpty()) {
                String searchPattern = "%" + request.getSearch().trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate activeIngredientMatch = cb.like(cb.lower(root.get("activeIngredient")), searchPattern);

                Join<Product, ProductVariant> variantJoin = root.join("variants", JoinType.LEFT);
                Predicate skuMatch = cb.like(cb.lower(variantJoin.get("sku")), searchPattern);
                Predicate barcodeMatch = cb.like(cb.lower(variantJoin.get("barcode")), searchPattern);

                predicates.add(cb.or(nameMatch, activeIngredientMatch, skuMatch, barcodeMatch));
                query.distinct(true);
            }

            if (request.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), request.getCategoryId()));
            }

            if (request.getBrandId() != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), request.getBrandId()));
            }

            if (request.getTargetSpecies() != null && !request.getTargetSpecies().trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("targetSpecies")), request.getTargetSpecies().trim().toLowerCase()));
            }

            if (request.getRequiresPrescription() != null) {
                predicates.add(cb.equal(root.get("requiresPrescription"), request.getRequiresPrescription()));
            }

            if (Boolean.TRUE.equals(request.getIsLowStock())) {
                Join<Product, ProductVariant> variantJoin = root.join("variants", JoinType.INNER);
                predicates.add(cb.lessThanOrEqualTo(variantJoin.get("stock"), variantJoin.get("minStock")));
                query.distinct(true);
            }

            String status = request.getStatus();
            if (status == null || status.isBlank()) {
                // Por defecto solo se listan productos activos
                predicates.add(cb.isTrue(root.get("isActive")));
            } else if (!"todos".equalsIgnoreCase(status.trim())) {
                boolean activeValue = "activo".equalsIgnoreCase(status.trim());
                predicates.add(cb.equal(root.get("isActive"), activeValue));
            }
            // status == "todos": sin filtro de estado, se listan todos

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<ProductDTO> results;
        long totalCount;
        String nextUrl = null;
        String prevUrl = null;

        if (request.getLimit() != null && request.getLimit() > 0) {
            int limit = request.getLimit();
            int offset = request.getOffset() != null && request.getOffset() >= 0 ? request.getOffset() : 0;
            int pageNumber = offset / limit;
            Pageable pageable = PageRequest.of(pageNumber, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Product> page = productRepository.findAll(spec, pageable);

            results = page.getContent().stream()
                    .map(productMapper::toDTO)
                    .toList();
            totalCount = page.getTotalElements();
            nextUrl = page.hasNext() ? "?limit=" + limit + "&offset=" + (offset + limit) : null;
            prevUrl = page.hasPrevious() ? "?limit=" + limit + "&offset=" + Math.max(0, offset - limit) : null;
        } else {
            List<Product> list = productRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
            results = list.stream()
                    .map(productMapper::toDTO)
                    .toList();
            totalCount = list.size();
        }

        return PaginatedResponse.<ProductDTO>builder()
                .results(results)
                .count(totalCount)
                .next(nextUrl)
                .previous(prevUrl)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + id));
        return productMapper.toDTO(product);
    }

    private final UserRepository userRepository;

    @Override
    @Transactional
    public ProductDTO createProduct(CreateProductDTO dto) {
        return createProduct(dto, null);
    }

    @Override
    @Transactional
    public ProductDTO createProduct(CreateProductDTO dto, User currentUser) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Categoría no encontrada"));

        Brand brand = null;
        if (dto.getBrandId() != null) {
            brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new NotFoundException("Marca no encontrada"));
        }

        String imageUrl = null;
        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            imageUrl = storageService.save(dto.getImage(), StorageFolder.PRODUCTS);
        }

        Product product = Product.builder()
                .category(category)
                .brand(brand)
                .name(dto.getName().trim())
                .activeIngredient(dto.getActiveIngredient() != null ? dto.getActiveIngredient().trim() : null)
                .targetSpecies(dto.getTargetSpecies() != null ? dto.getTargetSpecies().trim() : null)
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .requiresPrescription(Boolean.TRUE.equals(dto.getRequiresPrescription()))
                .allowsFractioning(Boolean.TRUE.equals(dto.getAllowsFractioning()))
                .imageUrl(imageUrl)
                .isActive(true)
                .build();

        Product savedProduct = productRepository.save(product);

        if (dto.getVariants() != null) {
            for (CreateProductVariantDTO varDto : dto.getVariants()) {
                saveOrUpdateProductVariant(savedProduct, varDto, currentUser);
            }
        }

        productRepository.saveAndFlush(savedProduct);
        return getProductById(savedProduct.getId());
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(UUID id, UpdateProductDTO dto) {
        return updateProduct(id, dto, null);
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(UUID id, UpdateProductDTO dto, User currentUser) {
        Product product = productRepository.findById(id)
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + id));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Categoría no encontrada"));

        Brand brand = null;
        if (dto.getBrandId() != null) {
            brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new NotFoundException("Marca no encontrada"));
        }

        String imageUrl = storageService.updateFile(dto.getImage(), product.getImageUrl(), dto.getRemoveImage(), StorageFolder.PRODUCTS);

        product.setCategory(category);
        product.setBrand(brand);
        product.setName(dto.getName().trim());
        product.setActiveIngredient(dto.getActiveIngredient() != null ? dto.getActiveIngredient().trim() : null);
        product.setTargetSpecies(dto.getTargetSpecies() != null ? dto.getTargetSpecies().trim() : null);
        product.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        product.setRequiresPrescription(Boolean.TRUE.equals(dto.getRequiresPrescription()));
        product.setAllowsFractioning(Boolean.TRUE.equals(dto.getAllowsFractioning()));
        product.setImageUrl(imageUrl);

        Set<UUID> processedVariantIds = new HashSet<>();

        if (dto.getVariants() != null) {
            for (CreateProductVariantDTO varDto : dto.getVariants()) {
                ProductVariant variant = saveOrUpdateProductVariant(product, varDto, currentUser);
                processedVariantIds.add(variant.getId());
            }
        }

        // Soft-delete variants that were removed in the edit form (do not hard-delete to avoid FK constraint errors with invoice_items)
        if (product.getVariants() != null) {
            for (ProductVariant existingVar : product.getVariants()) {
                if (!processedVariantIds.contains(existingVar.getId())) {
                    existingVar.setIsActive(false);
                    variantRepository.save(existingVar);
                }
            }
        }

        productRepository.saveAndFlush(product);
        return getProductById(id);
    }

    @Override
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + id));

        product.setIsActive(false);
        if (product.getVariants() != null) {
            for (ProductVariant variant : product.getVariants()) {
                variant.setIsActive(false);
            }
        }
        productRepository.saveAndFlush(product);
    }

    @Override
    @Transactional
    public void reactivateProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + id));

        product.setIsActive(true);
        if (product.getVariants() != null) {
            for (ProductVariant variant : product.getVariants()) {
                variant.setIsActive(true);
            }
        }
        productRepository.saveAndFlush(product);
    }

    private User resolveUser(User currentUser) {
        if (currentUser != null) return currentUser;
        return userRepository.findAll().stream().findFirst().orElse(null);
    }

    private ProductVariant saveOrUpdateProductVariant(Product product, CreateProductVariantDTO varDto, User currentUser) {
        String sku = varDto.getSku() != null && !varDto.getSku().trim().isEmpty() ? varDto.getSku().trim() : null;
        String barcode = varDto.getBarcode() != null && !varDto.getBarcode().trim().isEmpty() ? varDto.getBarcode().trim() : null;

        if (sku != null && variantRepository.existsBySku(sku)) {
            Optional<ProductVariant> existing = variantRepository.findBySku(sku);
            if (existing.isPresent() && !existing.get().getProduct().getId().equals(product.getId())) {
                throw new ConflictException("El SKU " + sku + " ya está asignado a otro producto");
            }
        }

        if (barcode != null && variantRepository.existsByBarcode(barcode)) {
            Optional<ProductVariant> existing = variantRepository.findByBarcode(barcode);
            if (existing.isPresent() && !existing.get().getProduct().getId().equals(product.getId())) {
                throw new ConflictException("El código de barras " + barcode + " ya está asignado a otro producto");
            }
        }

        ProductVariant variant = null;
        if (varDto.getId() != null) {
            variant = variantRepository.findById(varDto.getId()).orElse(null);
        }

        // Fallback search by matching SKU or Barcode within same product
        if (variant == null && sku != null) {
            Optional<ProductVariant> bySku = variantRepository.findBySku(sku);
            if (bySku.isPresent() && bySku.get().getProduct().getId().equals(product.getId())) {
                variant = bySku.get();
            }
        }

        if (variant == null) {
            variant = ProductVariant.builder()
                    .product(product)
                    .isActive(true)
                    .build();
        }

        int oldStock = (variant.getId() != null && variant.getStock() != null) ? variant.getStock() : 0;
        int newStock = varDto.getStock() != null ? varDto.getStock() : 0;
        int stockDiff = newStock - oldStock;

        variant.setSku(sku);
        variant.setBarcode(barcode);
        variant.setName(varDto.getName().trim());
        variant.setSalePrice(varDto.getSalePrice());
        variant.setCostPrice(varDto.getCostPrice());
        variant.setStock(newStock);
        variant.setMinStock(varDto.getMinStock() != null ? varDto.getMinStock() : 5);
        variant.setUnitMeasure(varDto.getUnitMeasure().trim());
        variant.setAdministrationRoute(validateAdministrationRoute(varDto.getAdministrationRoute()));
        variant.setWeightOrVolume(varDto.getWeightOrVolume());
        variant.setIsActive(true);

        ProductVariant savedVariant = variantRepository.save(variant);

        User auditUser = resolveUser(currentUser);

        // Record Kardex movement for overall variant stock change
        if (stockDiff != 0) {
            String movementType = stockDiff > 0 ? "ajuste_ingreso" : "ajuste_salida";
            InventoryMovement movement = InventoryMovement.builder()
                    .variant(savedVariant)
                    .movementType(movementType)
                    .quantity(BigDecimal.valueOf(stockDiff))
                    .previousStock(BigDecimal.valueOf(oldStock))
                    .newStock(BigDecimal.valueOf(newStock))
                    .referenceType("product_adjustment")
                    .referenceId(savedVariant.getId())
                    .notes((stockDiff > 0 ? "Ingreso / Ajuste manual de stock" : "Salida / Ajuste manual de stock")
                            + " en variante '" + savedVariant.getName() + "' (Anterior: " + oldStock + ", Nuevo: " + newStock + ")")
                    .user(auditUser)
                    .createdAt(Instant.now())
                    .build();
            movementRepository.save(movement);
        }

        if (varDto.getLots() != null) {
            for (CreateInventoryLotDTO lotDto : varDto.getLots()) {
                Optional<InventoryLot> existingLot = Optional.empty();
                if (lotDto.getLotNumber() != null && !lotDto.getLotNumber().trim().isEmpty()) {
                    existingLot = lotRepository.findByVariantIdAndLotNumber(savedVariant.getId(), lotDto.getLotNumber().trim());
                }

                int newLotQty = lotDto.getQuantity() != null ? lotDto.getQuantity() : 0;

                if (existingLot.isPresent()) {
                    InventoryLot lot = existingLot.get();
                    int oldLotQty = lot.getQuantity() != null ? lot.getQuantity() : 0;
                    int lotDiff = newLotQty - oldLotQty;

                    lot.setQuantity(newLotQty);
                    lot.setExpirationDate(lotDto.getExpirationDate());
                    lot.setCostPrice(lotDto.getCostPrice() != null ? lotDto.getCostPrice() : varDto.getCostPrice());
                    InventoryLot savedLot = lotRepository.save(lot);

                    if (lotDiff != 0) {
                        String lotMovementType = lotDiff > 0 ? "ajuste_ingreso" : "ajuste_salida";
                        InventoryMovement lotMovement = InventoryMovement.builder()
                                .variant(savedVariant)
                                .lot(savedLot)
                                .movementType(lotMovementType)
                                .quantity(BigDecimal.valueOf(lotDiff))
                                .previousStock(BigDecimal.valueOf(oldLotQty))
                                .newStock(BigDecimal.valueOf(newLotQty))
                                .referenceType("lot_adjustment")
                                .referenceId(savedLot.getId())
                                .notes((lotDiff > 0 ? "Ingreso de stock en lote " : "Ajuste/Salida de stock en lote ")
                                        + savedLot.getLotNumber() + " (Anterior: " + oldLotQty + ", Nuevo: " + newLotQty + ")")
                                .user(auditUser)
                                .createdAt(Instant.now())
                                .build();
                        movementRepository.save(lotMovement);
                    }
                } else {
                    InventoryLot lot = InventoryLot.builder()
                            .variant(savedVariant)
                            .lotNumber(lotDto.getLotNumber().trim())
                            .expirationDate(lotDto.getExpirationDate())
                            .quantity(newLotQty)
                            .costPrice(lotDto.getCostPrice() != null ? lotDto.getCostPrice() : varDto.getCostPrice())
                            .status("disponible")
                            .build();
                    InventoryLot savedLot = lotRepository.save(lot);

                    if (newLotQty > 0) {
                        InventoryMovement lotMovement = InventoryMovement.builder()
                                .variant(savedVariant)
                                .lot(savedLot)
                                .movementType("ajuste_ingreso")
                                .quantity(BigDecimal.valueOf(newLotQty))
                                .previousStock(BigDecimal.ZERO)
                                .newStock(BigDecimal.valueOf(newLotQty))
                                .referenceType("lot_create")
                                .referenceId(savedLot.getId())
                                .notes("Ingreso inicial por creación de lote " + savedLot.getLotNumber() + " (" + newLotQty + " unidades)")
                                .user(auditUser)
                                .createdAt(Instant.now())
                                .build();
                        movementRepository.save(lotMovement);
                    }
                }
            }
        } else {
            // El formulario de Productos no gestiona lotes explícitos: para que el
            // stock declarado aquí sea realmente descontable (FEFO en ventas/vacunación/
            // desparasitación), se mantiene un lote genérico sincronizado con el stock.
            syncAutoLot(savedVariant, newStock, varDto.getCostPrice());
        }

        if (product.getVariants() == null) {
            product.setVariants(new ArrayList<>());
        }
        if (!product.getVariants().contains(savedVariant)) {
            product.getVariants().add(savedVariant);
        }

        return savedVariant;
    }

    private static final Set<String> ADMINISTRATION_ROUTES = Set.of("oral", "inyectable", "topico", "otro");

    private String validateAdministrationRoute(String administrationRoute) {
        String normalized = administrationRoute == null ? "" : administrationRoute.trim().toLowerCase();
        if (!ADMINISTRATION_ROUTES.contains(normalized)) {
            throw new BusinessException("Vía de administración inválida. Valores permitidos: " + String.join(", ", ADMINISTRATION_ROUTES));
        }
        return normalized;
    }

    // Lote genérico usado cuando el producto se crea/edita sin lotes explícitos.
    // Fecha de vencimiento lejana como centinela: no representa un vencimiento real,
    // solo asegura que este lote se consuma (FEFO) después de cualquier lote con
    // fecha real más próxima.
    private static final String AUTO_LOT_NUMBER = "AUTO";
    private static final LocalDate AUTO_LOT_EXPIRATION = LocalDate.of(2099, 12, 31);

    private void syncAutoLot(ProductVariant variant, int newStock, BigDecimal costPrice) {
        Optional<InventoryLot> existingLot = lotRepository.findByVariantIdAndLotNumber(variant.getId(), AUTO_LOT_NUMBER);
        if (existingLot.isPresent()) {
            InventoryLot lot = existingLot.get();
            lot.setQuantity(newStock);
            lot.setCostPrice(costPrice != null ? costPrice : lot.getCostPrice());
            lot.setStatus(newStock > 0 ? "disponible" : "agotado");
            lotRepository.save(lot);
        } else if (newStock > 0) {
            InventoryLot lot = InventoryLot.builder()
                    .variant(variant)
                    .lotNumber(AUTO_LOT_NUMBER)
                    .expirationDate(AUTO_LOT_EXPIRATION)
                    .quantity(newStock)
                    .costPrice(costPrice)
                    .status("disponible")
                    .build();
            lotRepository.save(lot);
        }
    }
}
