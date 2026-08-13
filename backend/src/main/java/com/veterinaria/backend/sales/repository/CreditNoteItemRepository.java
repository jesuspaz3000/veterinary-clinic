package com.veterinaria.backend.sales.repository;

import com.veterinaria.backend.sales.model.CreditNoteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface CreditNoteItemRepository extends JpaRepository<CreditNoteItem, UUID> {

    List<CreditNoteItem> findByCreditNoteId(UUID creditNoteId);

    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM CreditNoteItem c WHERE c.invoiceItem.id = :invoiceItemId")
    BigDecimal findTotalReturnedQuantityByInvoiceItemId(@Param("invoiceItemId") UUID invoiceItemId);
}
