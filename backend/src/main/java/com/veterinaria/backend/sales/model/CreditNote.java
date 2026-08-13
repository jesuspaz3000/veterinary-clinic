package com.veterinaria.backend.sales.model;

import com.veterinaria.backend.user.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "credit_notes", indexes = {
        @Index(name = "idx_credit_notes_series_correlative", columnList = "series, correlative", unique = true),
        @Index(name = "idx_credit_notes_number", columnList = "credit_note_number", unique = true),
        @Index(name = "idx_credit_notes_invoice", columnList = "invoice_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(nullable = false, length = 20)
    private String series;

    @Column(nullable = false)
    private Integer correlative;

    @Column(name = "credit_note_number", nullable = false, unique = true, length = 50)
    private String creditNoteNumber;

    @Column(nullable = false, length = 150)
    private String reason; // devolucion, error_emision, descuento_post_venta

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Builder.Default
    @Column(name = "restock_inventory", nullable = false)
    private Boolean restockInventory = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @OneToMany(mappedBy = "creditNote", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CreditNoteItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
