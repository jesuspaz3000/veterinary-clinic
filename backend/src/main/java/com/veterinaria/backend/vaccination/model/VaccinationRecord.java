package com.veterinaria.backend.vaccination.model;

import com.veterinaria.backend.medicalrecord.model.MedicalRecord;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.product.model.Product;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "vaccination_record", indexes = {
        @Index(name = "idx_vaccination_record_pet", columnList = "pet_id"),
        @Index(name = "idx_vaccination_record_application_date", columnList = "application_date"),
        @Index(name = "idx_vaccination_record_next_dose_date", columnList = "next_dose_date")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"pet", "medicalRecord", "product", "veterinarian"})
public class VaccinationRecord {

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

    @Column(name = "vaccine_name", nullable = false, length = 150)
    private String vaccineName; // snapshot de product.name al momento de la aplicación

    @Column(name = "vaccine_brand", length = 150)
    private String vaccineBrand; // snapshot de product.brand.name

    @Column(name = "batch_number", length = 100)
    private String batchNumber;

    @Column(name = "application_date", nullable = false)
    private LocalDate applicationDate;

    @Column(name = "next_dose_date")
    private LocalDate nextDoseDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private Veterinarian veterinarian;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
