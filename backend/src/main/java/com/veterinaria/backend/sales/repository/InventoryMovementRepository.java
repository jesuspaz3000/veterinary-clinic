package com.veterinaria.backend.sales.repository;

import com.veterinaria.backend.sales.model.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, UUID>, JpaSpecificationExecutor<InventoryMovement> {
    List<InventoryMovement> findByVariantIdOrderByCreatedAtDesc(UUID variantId);
}
