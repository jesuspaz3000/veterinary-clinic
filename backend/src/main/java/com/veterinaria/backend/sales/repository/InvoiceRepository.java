package com.veterinaria.backend.sales.repository;

import com.veterinaria.backend.sales.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID>, JpaSpecificationExecutor<Invoice> {

    @Query("SELECT MAX(i.correlative) FROM Invoice i WHERE i.series = :series")
    Optional<Integer> findMaxCorrelativeBySeries(@Param("series") String series);

    boolean existsByInvoiceNumber(String invoiceNumber);
}
