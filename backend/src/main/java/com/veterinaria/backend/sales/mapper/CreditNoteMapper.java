package com.veterinaria.backend.sales.mapper;

import com.veterinaria.backend.sales.dto.CreditNoteDTO;
import com.veterinaria.backend.sales.dto.CreditNoteItemDTO;
import com.veterinaria.backend.sales.model.CreditNote;
import com.veterinaria.backend.sales.model.CreditNoteItem;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class CreditNoteMapper {

    public CreditNoteDTO toDTO(CreditNote creditNote) {
        if (creditNote == null) return null;

        var itemsDTO = creditNote.getItems() != null
                ? creditNote.getItems().stream().map(this::toItemDTO).collect(Collectors.toList())
                : Collections.<CreditNoteItemDTO>emptyList();

        String userName = null;
        if (creditNote.getUser() != null) {
            String fn = creditNote.getUser().getFirstName() != null ? creditNote.getUser().getFirstName().trim() : "";
            String ln = creditNote.getUser().getLastName() != null ? creditNote.getUser().getLastName().trim() : "";
            String fullName = (fn + " " + ln).trim();
            userName = !fullName.isEmpty() ? fullName : creditNote.getUser().getUsername();
        }

        return CreditNoteDTO.builder()
                .id(creditNote.getId())
                .invoiceId(creditNote.getInvoice() != null ? creditNote.getInvoice().getId() : null)
                .invoiceNumber(creditNote.getInvoice() != null ? creditNote.getInvoice().getInvoiceNumber() : null)
                .series(creditNote.getSeries())
                .correlative(creditNote.getCorrelative())
                .creditNoteNumber(creditNote.getCreditNoteNumber())
                .reason(creditNote.getReason())
                .total(creditNote.getTotal())
                .restockInventory(creditNote.getRestockInventory())
                .userId(creditNote.getUser() != null ? creditNote.getUser().getId() : null)
                .userName(userName)
                .issuedAt(creditNote.getIssuedAt())
                .createdAt(creditNote.getCreatedAt())
                .items(itemsDTO)
                .build();
    }

    public CreditNoteItemDTO toItemDTO(CreditNoteItem item) {
        if (item == null) return null;

        String description = item.getInvoiceItem() != null ? item.getInvoiceItem().getDescription() : null;

        return CreditNoteItemDTO.builder()
                .id(item.getId())
                .invoiceItemId(item.getInvoiceItem() != null ? item.getInvoiceItem().getId() : null)
                .description(description)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build();
    }
}
