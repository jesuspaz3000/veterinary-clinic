package com.veterinaria.backend.sales.service.Impl;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.product.model.InventoryLot;
import com.veterinaria.backend.product.model.ProductVariant;
import com.veterinaria.backend.product.repository.InventoryLotRepository;
import com.veterinaria.backend.product.repository.ProductVariantRepository;
import com.veterinaria.backend.sales.dto.CreateCreditNoteDTO;
import com.veterinaria.backend.sales.dto.CreateCreditNoteItemDTO;
import com.veterinaria.backend.sales.dto.CreditNoteDTO;
import com.veterinaria.backend.sales.mapper.CreditNoteMapper;
import com.veterinaria.backend.sales.model.*;
import com.veterinaria.backend.sales.repository.*;
import com.veterinaria.backend.sales.service.CreditNoteService;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreditNoteServiceImpl implements CreditNoteService {

    private final CreditNoteRepository creditNoteRepository;
    private final CreditNoteItemRepository creditNoteItemRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryLotRepository lotRepository;
    private final InventoryMovementRepository movementRepository;
    private final UserRepository userRepository;
    private final CreditNoteMapper creditNoteMapper;

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<CreditNoteDTO> getAllCreditNotes(int limit, int offset) {
        int pageLimit = limit > 0 ? limit : 10;
        int pageNumber = offset / pageLimit;
        PageRequest pageRequest = PageRequest.of(pageNumber, pageLimit, Sort.by(Sort.Direction.DESC, "issuedAt"));

        Page<CreditNote> pageResult = creditNoteRepository.findAll(pageRequest);
        List<CreditNoteDTO> dtos = pageResult.getContent().stream()
                .map(creditNoteMapper::toDTO)
                .toList();

        return PaginatedResponse.<CreditNoteDTO>builder()
                .count(pageResult.getTotalElements())
                .results(dtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CreditNoteDTO getCreditNoteById(UUID id) {
        CreditNote creditNote = creditNoteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Nota de crédito no encontrada."));
        return creditNoteMapper.toDTO(creditNote);
    }

    @Override
    @Transactional
    public CreditNoteDTO createCreditNote(CreateCreditNoteDTO dto, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException("Usuario emisor no encontrado."));

        Invoice invoice = invoiceRepository.findById(dto.getInvoiceId())
                .orElseThrow(() -> new NotFoundException("Comprobante de venta original no encontrado."));

        if ("anulado".equalsIgnoreCase(invoice.getPaymentStatus())) {
            throw new BusinessException("El comprobante de venta N° " + invoice.getInvoiceNumber() + " ya se encuentra anulado.");
        }

        String series = StringUtils.hasText(dto.getSeries()) ? dto.getSeries().toUpperCase() : "NC01";
        int correlative = creditNoteRepository.findMaxCorrelativeBySeries(series).orElse(0) + 1;
        String creditNoteNumber = String.format("%s-%08d", series, correlative);

        boolean restock = Boolean.TRUE.equals(dto.getRestockInventory());

        CreditNote creditNote = CreditNote.builder()
                .invoice(invoice)
                .series(series)
                .correlative(correlative)
                .creditNoteNumber(creditNoteNumber)
                .reason(dto.getReason())
                .total(BigDecimal.ZERO)
                .restockInventory(restock)
                .user(currentUser)
                .issuedAt(Instant.now())
                .items(new ArrayList<>())
                .build();

        BigDecimal grandTotal = BigDecimal.ZERO;

        for (CreateCreditNoteItemDTO itemDto : dto.getItems()) {
            InvoiceItem invoiceItem = invoiceItemRepository.findById(itemDto.getInvoiceItemId())
                    .orElseThrow(() -> new NotFoundException("Ítem de venta no encontrado."));

            if (!invoiceItem.getInvoice().getId().equals(invoice.getId())) {
                throw new BusinessException("El ítem '" + invoiceItem.getDescription() + "' no pertenece al comprobante " + invoice.getInvoiceNumber());
            }

            BigDecimal requestedQty = itemDto.getQuantity();

            // Cumulative validation: total returned so far + requested <= sold
            BigDecimal previouslyReturned = creditNoteItemRepository.findTotalReturnedQuantityByInvoiceItemId(invoiceItem.getId());
            BigDecimal availableToReturn = invoiceItem.getQuantity().subtract(previouslyReturned);

            if (requestedQty.compareTo(availableToReturn) > 0) {
                throw new BusinessException(String.format("No se puede devolver %.3f de '%s'. Máximo disponible a devolver: %.3f (Vendidos: %.3f, Ya devueltos previamente: %.3f).",
                        requestedQty, invoiceItem.getDescription(), availableToReturn, invoiceItem.getQuantity(), previouslyReturned));
            }

            BigDecimal lineSubtotal = invoiceItem.getUnitPrice().multiply(requestedQty).setScale(2, RoundingMode.HALF_UP);
            grandTotal = grandTotal.add(lineSubtotal);

            CreditNoteItem cnItem = CreditNoteItem.builder()
                    .creditNote(creditNote)
                    .invoiceItem(invoiceItem)
                    .quantity(requestedQty)
                    .unitPrice(invoiceItem.getUnitPrice())
                    .subtotal(lineSubtotal)
                    .build();

            creditNote.getItems().add(cnItem);

            // Repose stock if requested and item has product variant
            if (restock && invoiceItem.getVariant() != null) {
                ProductVariant variant = invoiceItem.getVariant();
                int prevStockInt = variant.getStock() != null ? variant.getStock() : 0;
                int returnQtyInt = requestedQty.setScale(0, RoundingMode.CEILING).intValue();
                int newStockInt = prevStockInt + returnQtyInt;

                variant.setStock(newStockInt);
                variantRepository.save(variant);

                // Repose to lots linked in invoiceItemLots if present
                InventoryLot lotToRestock = null;
                if (invoiceItem.getItemLots() != null && !invoiceItem.getItemLots().isEmpty()) {
                    lotToRestock = invoiceItem.getItemLots().get(0).getLot();
                    if (lotToRestock != null) {
                        int lotPrevQty = lotToRestock.getQuantity() != null ? lotToRestock.getQuantity() : 0;
                        lotToRestock.setQuantity(lotPrevQty + returnQtyInt);
                        if ("agotado".equalsIgnoreCase(lotToRestock.getStatus())) {
                            lotToRestock.setStatus("disponible");
                        }
                        lotRepository.save(lotToRestock);
                    }
                }

                // Kardex movement
                InventoryMovement movement = InventoryMovement.builder()
                        .variant(variant)
                        .lot(lotToRestock)
                        .movementType("devolucion")
                        .quantity(requestedQty)
                        .previousStock(BigDecimal.valueOf(prevStockInt))
                        .newStock(BigDecimal.valueOf(newStockInt))
                        .referenceType("credit_note")
                        .referenceId(creditNote.getId())
                        .notes("Devolución según Nota de Crédito N° " + creditNoteNumber)
                        .user(currentUser)
                        .build();

                movementRepository.save(movement);
            }
        }

        creditNote.setTotal(grandTotal);

        // Check if all items in invoice have been fully returned to mark invoice as "anulado"
        boolean allFullyReturned = true;
        for (InvoiceItem item : invoice.getItems()) {
            BigDecimal totalReturned = creditNoteItemRepository.findTotalReturnedQuantityByInvoiceItemId(item.getId());
            // Find current in-flight returned for this item
            BigDecimal currentItemReturn = dto.getItems().stream()
                    .filter(i -> i.getInvoiceItemId().equals(item.getId()))
                    .map(CreateCreditNoteItemDTO::getQuantity)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalReturned.add(currentItemReturn).compareTo(item.getQuantity()) < 0) {
                allFullyReturned = false;
                break;
            }
        }

        if (allFullyReturned) {
            invoice.setPaymentStatus("anulado");
            invoiceRepository.save(invoice);
        }

        CreditNote savedCreditNote = creditNoteRepository.saveAndFlush(creditNote);
        return creditNoteMapper.toDTO(savedCreditNote);
    }
}
