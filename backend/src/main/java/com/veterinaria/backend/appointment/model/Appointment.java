package com.veterinaria.backend.appointment.model;

import com.veterinaria.backend.grooming.model.GroomingStaff;
import com.veterinaria.backend.pet.model.Pet;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "appointments", indexes = {
        @Index(name = "idx_appointments_date", columnList = "date"),
        @Index(name = "idx_appointments_pet", columnList = "pet_id"),
        @Index(name = "idx_appointments_veterinarian", columnList = "veterinarian_id"),
        @Index(name = "idx_appointments_grooming_staff", columnList = "grooming_staff_id"),
        @Index(name = "idx_appointments_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"pet", "veterinarian", "groomingStaff"})
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Profesional asignado: veterinario o personal de grooming (mutuamente excluyentes)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id")
    private Veterinarian veterinarian;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grooming_staff_id")
    private GroomingStaff groomingStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "service_type", nullable = false, length = 100)
    private String serviceType;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "pendiente"; // pendiente, confirmada, completada, cancelada

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
