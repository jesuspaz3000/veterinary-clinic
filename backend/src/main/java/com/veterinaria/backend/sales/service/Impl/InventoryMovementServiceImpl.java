package com.veterinaria.backend.sales.service.Impl;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.product.model.InventoryLot;
import com.veterinaria.backend.product.model.ProductVariant;
import com.veterinaria.backend.product.repository.InventoryLotRepository;
import com.veterinaria.backend.product.repository.ProductVariantRepository;
import com.veterinaria.backend.sales.dto.InventoryMovementDTO;
import com.veterinaria.backend.sales.mapper.InventoryMovementMapper;
import com.veterinaria.backend.sales.model.InventoryMovement;
import com.veterinaria.backend.sales.repository.InventoryMovementRepository;
import com.veterinaria.backend.sales.service.InventoryMovementService;
import com.veterinaria.backend.sales.service.LotDeduction;
import com.veterinaria.backend.user.model.User;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryMovementServiceImpl implements InventoryMovementService {

    private final InventoryMovementRepository movementRepository;
    private final InventoryMovementMapper movementMapper;
    private final ProductVariantRepository variantRepository;
    private final InventoryLotRepository lotRepository;

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<InventoryMovementDTO> getMovements(
            UUID variantId,
            UUID lotId,
            String movementType,
            Instant startDate,
            Instant endDate,
            int limit,
            int offset
    ) {
        Specification<InventoryMovement> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (variantId != null) {
                predicates.add(cb.equal(root.get("variant").get("id"), variantId));
            }

            if (lotId != null) {
                predicates.add(cb.equal(root.get("lot").get("id"), lotId));
            }

            if (StringUtils.hasText(movementType)) {
                predicates.add(cb.equal(root.get("movementType"), movementType.toLowerCase()));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        int pageLimit = limit > 0 ? limit : 10;
        int pageNumber = offset / pageLimit;
        PageRequest pageRequest = PageRequest.of(pageNumber, pageLimit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<InventoryMovement> pageResult = movementRepository.findAll(spec, pageRequest);
        List<InventoryMovementDTO> dtos = pageResult.getContent().stream()
                .map(movementMapper::toDTO)
                .toList();

        return PaginatedResponse.<InventoryMovementDTO>builder()
                .count(pageResult.getTotalElements())
                .results(dtos)
                .build();
    }

    @Override
    @Transactional
    public List<LotDeduction> consumeStock(ProductVariant variant, BigDecimal totalQtyNeeded, String movementType,
                                            String referenceType, UUID referenceId, String notes, User user) {
        List<InventoryLot> availableLots = lotRepository.findByVariantIdAndStatusOrderByExpirationDateAsc(variant.getId(), "disponible");

        BigDecimal remainingQtyNeeded = totalQtyNeeded;
        int variantStock = variant.getStock() != null ? variant.getStock() : 0;
        BigDecimal prevVariantStock = BigDecimal.valueOf(variantStock);
        List<LotDeduction> deductions = new ArrayList<>();

        for (InventoryLot lot : availableLots) {
            if (remainingQtyNeeded.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal lotQty = BigDecimal.valueOf(lot.getQuantity() != null ? lot.getQuantity() : 0);
            if (lotQty.compareTo(BigDecimal.ZERO) <= 0) continue;

            BigDecimal qtyToDeductFromLot;
            if (lotQty.compareTo(remainingQtyNeeded) >= 0) {
                qtyToDeductFromLot = remainingQtyNeeded;
                int newLotQty = lotQty.subtract(qtyToDeductFromLot).intValue();
                lot.setQuantity(newLotQty);
                if (newLotQty == 0) {
                    lot.setStatus("agotado");
                }
                remainingQtyNeeded = BigDecimal.ZERO;
            } else {
                qtyToDeductFromLot = lotQty;
                lot.setQuantity(0);
                lot.setStatus("agotado");
                remainingQtyNeeded = remainingQtyNeeded.subtract(lotQty);
            }

            lotRepository.save(lot);
            deductions.add(new LotDeduction(lot, qtyToDeductFromLot));
        }

        if (remainingQtyNeeded.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Stock insuficiente en los lotes disponibles de '" + variant.getName() + "' para completar la operación.");
        }

        // Deduct variant overall stock
        int qtyDeductedInt = totalQtyNeeded.setScale(0, RoundingMode.CEILING).intValue();
        int newVariantStockInt = Math.max(0, variantStock - qtyDeductedInt);
        variant.setStock(newVariantStockInt);
        variantRepository.save(variant);

        // Record Kardex movement
        InventoryMovement movement = InventoryMovement.builder()
                .variant(variant)
                .lot(deductions.isEmpty() ? null : deductions.get(0).lot())
                .movementType(movementType)
                .quantity(totalQtyNeeded.negate())
                .previousStock(prevVariantStock)
                .newStock(BigDecimal.valueOf(newVariantStockInt))
                .referenceType(referenceType)
                .referenceId(referenceId)
                .notes(notes)
                .user(user)
                .build();

        movementRepository.save(movement);

        return deductions;
    }
}
