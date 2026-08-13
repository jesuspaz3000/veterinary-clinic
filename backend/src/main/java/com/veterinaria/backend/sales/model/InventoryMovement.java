package com.veterinaria.backend.sales.model;

import com.veterinaria.backend.product.model.InventoryLot;
import com.veterinaria.backend.product.model.ProductVariant;
import com.veterinaria.backend.user.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inventory_movements", indexes = {
        @Index(name = "idx_inv_mov_variant", columnList = "variant_id"),
        @Index(name = "idx_inv_mov_lot", columnList = "lot_id"),
        @Index(name = "idx_inv_mov_type", columnList = "movement_type"),
        @Index(name = "idx_inv_mov_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id")
    private InventoryLot lot;

    @Column(name = "movement_type", nullable = false, length = 50)
    private String movementType; // venta, ajuste_ingreso, ajuste_salida, merma_vencimiento, devolucion

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;

    @Column(name = "previous_stock", nullable = false, precision = 10, scale = 3)
    private BigDecimal previousStock;

    @Column(name = "new_stock", nullable = false, precision = 10, scale = 3)
    private BigDecimal newStock;

    @Column(name = "reference_type", length = 50)
    private String referenceType; // invoice, prescription, credit_note, manual_adjustment

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
