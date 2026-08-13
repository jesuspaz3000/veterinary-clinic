package com.veterinaria.backend.medicalrecord.model;

import com.veterinaria.backend.appointment.model.Appointment;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "medical_record", indexes = {
        @Index(name = "idx_medical_record_pet", columnList = "pet_id"),
        @Index(name = "idx_medical_record_veterinarian", columnList = "veterinarian_id"),
        @Index(name = "idx_medical_record_date", columnList = "record_date"),
        @Index(name = "idx_medical_record_type", columnList = "record_type")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"pet", "veterinarian", "appointment", "prescriptions", "documents"})
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private Veterinarian veterinarian;

    // Cita de origen (opcional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    // consulta, cirugia, vacunacion, desparasitacion, emergencia, hospitalizacion
    @Column(name = "record_type", nullable = false, length = 30)
    private String recordType;

    @Column(name = "record_date", nullable = false)
    private Instant recordDate;

    @Column(length = 255)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Column(columnDefinition = "TEXT")
    private String observations;

    // Peso registrado en la consulta (kg)
    @Column(precision = 5, scale = 2)
    private BigDecimal weight;

    // Temperatura corporal (°C)
    @Column(precision = 4, scale = 2)
    private BigDecimal temperature;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "completado"; // completado, pendiente_seguimiento

    @Builder.Default
    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Prescription> prescriptions = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicalDocument> documents = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
