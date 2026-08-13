package com.veterinaria.backend.sales.mapper;

import com.veterinaria.backend.sales.dto.*;
import com.veterinaria.backend.sales.model.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class InvoiceMapper {

    public InvoiceDTO toDTO(Invoice invoice) {
        if (invoice == null) return null;

        var itemsDTO = invoice.getItems() != null
                ? invoice.getItems().stream().map(this::toItemDTO).collect(Collectors.toList())
                : Collections.<InvoiceItemDTO>emptyList();

        var paymentsDTO = invoice.getPayments() != null
                ? invoice.getPayments().stream().map(this::toPaymentDTO).collect(Collectors.toList())
                : Collections.<InvoicePaymentDTO>emptyList();

        String ownerName = null;
        String ownerDocNumber = null;
        if (invoice.getOwner() != null) {
            ownerName = (invoice.getOwner().getFirstName() + " " + invoice.getOwner().getLastName()).trim();
            ownerDocNumber = invoice.getOwner().getDocumentNumber();
        }

        String vetName = null;
        if (invoice.getVeterinarian() != null && invoice.getVeterinarian().getUser() != null) {
            vetName = (invoice.getVeterinarian().getUser().getFirstName() + " " + invoice.getVeterinarian().getUser().getLastName()).trim();
        }

        String userName = null;
        if (invoice.getUser() != null) {
            String fn = invoice.getUser().getFirstName() != null ? invoice.getUser().getFirstName().trim() : "";
            String ln = invoice.getUser().getLastName() != null ? invoice.getUser().getLastName().trim() : "";
            String fullName = (fn + " " + ln).trim();
            userName = !fullName.isEmpty() ? fullName : invoice.getUser().getUsername();
        }

        return InvoiceDTO.builder()
                .id(invoice.getId())
                .series(invoice.getSeries())
                .correlative(invoice.getCorrelative())
                .invoiceNumber(invoice.getInvoiceNumber())
                .invoiceType(invoice.getInvoiceType())
                .ownerId(invoice.getOwner() != null ? invoice.getOwner().getId() : null)
                .ownerName(ownerName)
                .ownerDocumentNumber(ownerDocNumber)
                .appointmentId(invoice.getAppointmentId())
                .veterinarianId(invoice.getVeterinarian() != null ? invoice.getVeterinarian().getId() : null)
                .veterinarianName(vetName)
                .paymentStatus(invoice.getPaymentStatus())
                .subtotal(invoice.getSubtotal())
                .discount(invoice.getDiscount())
                .tax(invoice.getTax())
                .total(invoice.getTotal())
                .notes(invoice.getNotes())
                .userId(invoice.getUser() != null ? invoice.getUser().getId() : null)
                .userName(userName)
                .issuedAt(invoice.getIssuedAt())
                .createdAt(invoice.getCreatedAt())
                .items(itemsDTO)
                .payments(paymentsDTO)
                .build();
    }

    public InvoiceItemDTO toItemDTO(InvoiceItem item) {
        if (item == null) return null;

        var lotsDTO = item.getItemLots() != null
                ? item.getItemLots().stream().map(this::toItemLotDTO).collect(Collectors.toList())
                : Collections.<InvoiceItemLotDTO>emptyList();

        String productName = null;
        String variantName = null;
        String sku = null;
        String unitMeasure = null;

        if (item.getVariant() != null) {
            variantName = item.getVariant().getName();
            sku = item.getVariant().getSku();
            unitMeasure = item.getVariant().getUnitMeasure();
            if (item.getVariant().getProduct() != null) {
                productName = item.getVariant().getProduct().getName();
            }
        }

        return InvoiceItemDTO.builder()
                .id(item.getId())
                .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                .productName(productName)
                .variantName(variantName)
                .sku(sku)
                .unitMeasure(unitMeasure)
                .prescriptionId(item.getPrescriptionId())
                .serviceName(item.getServiceName())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .discount(item.getDiscount())
                .subtotal(item.getSubtotal())
                .itemLots(lotsDTO)
                .build();
    }

    public InvoiceItemLotDTO toItemLotDTO(InvoiceItemLot lot) {
        if (lot == null) return null;

        return InvoiceItemLotDTO.builder()
                .id(lot.getId())
                .lotId(lot.getLot() != null ? lot.getLot().getId() : null)
                .lotNumber(lot.getLot() != null ? lot.getLot().getLotNumber() : null)
                .expirationDate(lot.getLot() != null ? lot.getLot().getExpirationDate() : null)
                .quantity(lot.getQuantity())
                .build();
    }

    public InvoicePaymentDTO toPaymentDTO(InvoicePayment payment) {
        if (payment == null) return null;

        return InvoicePaymentDTO.builder()
                .id(payment.getId())
                .paymentMethod(payment.getPaymentMethod())
                .amount(payment.getAmount())
                .referenceNumber(payment.getReferenceNumber())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
