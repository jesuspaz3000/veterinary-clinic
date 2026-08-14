package com.veterinaria.backend.hospitalization.model;

import com.veterinaria.backend.veterinarian.model.Veterinarian;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "hospitalization_evolution", indexes = {
        @Index(name = "idx_hospitalization_evolution_record", columnList = "hospitalization_record_id"),
        @Index(name = "idx_hospitalization_evolution_date", columnList = "evolution_date")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"hospitalizationRecord", "veterinarian"})
public class HospitalizationEvolution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hospitalization_record_id", nullable = false)
    private HospitalizationRecord hospitalizationRecord;

    @Column(name = "evolution_date", nullable = false)
    private Instant evolutionDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private Veterinarian veterinarian;

    @Column(precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(precision = 4, scale = 2)
    private BigDecimal temperature;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "food_intake", length = 20)
    private String foodIntake; // bueno, regular, malo, no_comio

    @Column(name = "water_intake", length = 20)
    private String waterIntake;

    @Column(length = 20)
    private String urination; // normal, aumentada, disminuida, ausente

    @Column(length = 20)
    private String defecation; // normal, diarrea, estreñimiento, ausente

    @Column(name = "activity_level", length = 20)
    private String activityLevel; // activo, letargico, postrado

    @Column(name = "medication_administered", columnDefinition = "TEXT")
    private String medicationAdministered;

    @Column(name = "procedures_performed", columnDefinition = "TEXT")
    private String proceduresPerformed;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
