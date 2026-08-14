package com.veterinaria.backend.hospitalization.model;

import com.veterinaria.backend.medicalrecord.model.MedicalRecord;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "hospitalization_record", indexes = {
        @Index(name = "idx_hospitalization_record_pet", columnList = "pet_id"),
        @Index(name = "idx_hospitalization_record_admission_date", columnList = "admission_date"),
        @Index(name = "idx_hospitalization_record_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"pet", "medicalRecord", "veterinarian", "evolutions"})
public class HospitalizationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medical_record_id", nullable = false)
    private MedicalRecord medicalRecord;

    @Column(name = "admission_date", nullable = false)
    private Instant admissionDate;

    @Column(name = "discharge_date")
    private Instant dischargeDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "cage_number", length = 50)
    private String cageNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private Veterinarian veterinarian;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "activo"; // activo, alta, transferido

    @Column(name = "final_diagnosis", columnDefinition = "TEXT")
    private String finalDiagnosis;

    @Column(name = "discharge_notes", columnDefinition = "TEXT")
    private String dischargeNotes;

    @OneToMany(mappedBy = "hospitalizationRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("evolutionDate DESC")
    @Builder.Default
    private List<HospitalizationEvolution> evolutions = new ArrayList<>();

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
