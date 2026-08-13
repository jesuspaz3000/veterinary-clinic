package com.veterinaria.backend.sales.repository;

import com.veterinaria.backend.sales.model.InvoiceItemLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceItemLotRepository extends JpaRepository<InvoiceItemLot, UUID> {
    List<InvoiceItemLot> findByInvoiceItemId(UUID invoiceItemId);
}
