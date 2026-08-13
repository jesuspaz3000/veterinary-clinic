package com.veterinaria.backend.sales.service.Impl;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.sales.dto.InventoryMovementDTO;
import com.veterinaria.backend.sales.mapper.InventoryMovementMapper;
import com.veterinaria.backend.sales.model.InventoryMovement;
import com.veterinaria.backend.sales.repository.InventoryMovementRepository;
import com.veterinaria.backend.sales.service.InventoryMovementService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryMovementServiceImpl implements InventoryMovementService {

    private final InventoryMovementRepository movementRepository;
    private final InventoryMovementMapper movementMapper;

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
}
