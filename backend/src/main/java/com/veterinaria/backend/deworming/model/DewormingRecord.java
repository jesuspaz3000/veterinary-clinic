package com.veterinaria.backend.deworming.model;

import com.veterinaria.backend.medicalrecord.model.MedicalRecord;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.product.model.Product;
import com.veterinaria.backend.product.model.ProductVariant;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "deworming_record", indexes = {
        @Index(name = "idx_deworming_record_pet", columnList = "pet_id"),
        @Index(name = "idx_deworming_record_application_date", columnList = "application_date"),
        @Index(name = "idx_deworming_record_next_application_date", columnList = "next_application_date")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"pet", "medicalRecord", "product", "productVariant", "veterinarian"})
public class DewormingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id")
    private MedicalRecord medicalRecord;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Presentación/lote específico del catálogo del que se descontó stock al aplicar el
    // antiparasitario. Nullable a nivel de columna porque registros previos a esta
    // migración no lo tienen; las altas nuevas siempre lo exigen a nivel de DTO/servicio.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id")
    private ProductVariant productVariant;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName; // snapshot de product.name al momento de la aplicación

    @Column(name = "product_brand", length = 150)
    private String productBrand; // snapshot de product.brand.name

    @Column(nullable = false, length = 100)
    private String dosage;

    @Column(name = "application_date", nullable = false)
    private LocalDate applicationDate;

    @Column(name = "next_application_date")
    private LocalDate nextApplicationDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private Veterinarian veterinarian;

    @Column(name = "deworming_type", nullable = false, length = 20)
    private String dewormingType; // interna, externa, ambas

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Builder.Default
    @Column(name = "is_active", nullable = false, columnDefinition = "boolean not null default true")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
