package com.veterinaria.backend.sales.repository;

import com.veterinaria.backend.sales.model.CreditNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreditNoteRepository extends JpaRepository<CreditNote, UUID>, JpaSpecificationExecutor<CreditNote> {

    @Query("SELECT MAX(c.correlative) FROM CreditNote c WHERE c.series = :series")
    Optional<Integer> findMaxCorrelativeBySeries(@Param("series") String series);

    List<CreditNote> findByInvoiceId(UUID invoiceId);

    boolean existsByCreditNoteNumber(String creditNoteNumber);
}
