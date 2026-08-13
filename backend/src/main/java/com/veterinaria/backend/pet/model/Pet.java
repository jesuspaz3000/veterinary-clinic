package com.veterinaria.backend.pet.model;

import com.veterinaria.backend.owner.model.Owner;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "pets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "species", nullable = false)
    private String species; // Perro, Gato, Ave, Roedor, Exótico

    @Column(name = "breed")
    private String breed;

    @Column(name = "color")
    private String color;

    @Column(name = "sex", nullable = false)
    private String sex; // Macho, Hembra

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "weight", precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "microchip_number", unique = true)
    private String microchipNumber;

    @Builder.Default
    @Column(name = "sterilized", nullable = false)
    private Boolean sterilized = false;

    @Column(name = "photo_url")
    private String photoUrl;

    @Builder.Default
    @Column(name = "status", nullable = false)
    private String status = "activo"; // activo, inactivo, fallecido

    @Column(name = "special_notes", length = 1000)
    private String specialNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
