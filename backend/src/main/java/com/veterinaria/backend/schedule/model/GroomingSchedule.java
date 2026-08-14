package com.veterinaria.backend.schedule.model;

import com.veterinaria.backend.grooming.model.GroomingStaff;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "grooming_schedule", uniqueConstraints = {
        @UniqueConstraint(name = "uk_grooming_schedule_day", columnNames = {"grooming_staff_id", "day_of_week"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "groomingStaff")
public class GroomingSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grooming_staff_id", nullable = false)
    private GroomingStaff groomingStaff;

    // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = true;

    // Eliminación lógica del registro de horario (distinto de isAvailable, que
    // indica si ese día de la semana es laborable)
    @Column(name = "is_active", nullable = false, columnDefinition = "boolean not null default true")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
