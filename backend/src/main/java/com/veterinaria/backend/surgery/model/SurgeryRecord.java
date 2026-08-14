package com.veterinaria.backend.surgery.model;

import com.veterinaria.backend.medicalrecord.model.MedicalRecord;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "surgery_record", indexes = {
        @Index(name = "idx_surgery_record_pet", columnList = "pet_id"),
        @Index(name = "idx_surgery_record_surgery_date", columnList = "surgery_date"),
        @Index(name = "idx_surgery_record_veterinarian", columnList = "veterinarian_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"pet", "medicalRecord", "veterinarian", "assistantVeterinarian"})
public class SurgeryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medical_record_id", nullable = false)
    private MedicalRecord medicalRecord;

    @Column(name = "surgery_type", nullable = false, length = 30)
    private String surgeryType; // esterilizacion, trauma, tumor

    @Column(name = "surgery_date", nullable = false)
    private Instant surgeryDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private Veterinarian veterinarian; // cirujano principal

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assistant_veterinarian_id")
    private Veterinarian assistantVeterinarian;

    @Column(name = "anesthesia_type", length = 100)
    private String anesthesiaType;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "pre_surgery_notes", columnDefinition = "TEXT")
    private String preSurgeryNotes;

    @Column(name = "surgery_notes", columnDefinition = "TEXT")
    private String surgeryNotes;

    @Column(name = "post_surgery_notes", columnDefinition = "TEXT")
    private String postSurgeryNotes;

    @Column(columnDefinition = "TEXT")
    private String complications;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "programada"; // programada, en_proceso, completada, cancelada

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
