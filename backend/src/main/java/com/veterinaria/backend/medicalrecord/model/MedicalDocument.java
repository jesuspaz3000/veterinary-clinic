package com.veterinaria.backend.medicalrecord.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "medical_document")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "record")
public class MedicalDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medical_record_id", nullable = false)
    private MedicalRecord record;

    // radiografia, examen_sangre, ecografia, receta
    @Column(name = "document_type", nullable = false, length = 30)
    private String documentType;

    // Ruta relativa dentro del storage (ej. "medical_documents/abc.pdf")
    @Column(name = "document_url", nullable = false)
    private String documentUrl;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(length = 255)
    private String description;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;
}
