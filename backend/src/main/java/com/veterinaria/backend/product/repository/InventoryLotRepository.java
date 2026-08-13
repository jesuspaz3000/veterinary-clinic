package com.veterinaria.backend.product.repository;

import com.veterinaria.backend.product.model.InventoryLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryLotRepository extends JpaRepository<InventoryLot, UUID> {
    List<InventoryLot> findByVariantIdOrderByExpirationDateAsc(UUID variantId);

    List<InventoryLot> findByVariantIdAndStatusOrderByExpirationDateAsc(UUID variantId, String status);

    Optional<InventoryLot> findByVariantIdAndLotNumber(UUID variantId, String lotNumber);

    @Query("SELECT l FROM InventoryLot l WHERE l.expirationDate <= :targetDate AND l.quantity > 0 ORDER BY l.expirationDate ASC")
    List<InventoryLot> findExpiringLots(@Param("targetDate") LocalDate targetDate);
}
