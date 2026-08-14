package com.veterinaria.backend.sales.service.Impl;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.owner.model.Owner;
import com.veterinaria.backend.owner.repository.OwnerRepository;
import com.veterinaria.backend.product.model.ProductVariant;
import com.veterinaria.backend.product.repository.ProductVariantRepository;
import com.veterinaria.backend.sales.dto.*;
import com.veterinaria.backend.sales.mapper.InvoiceMapper;
import com.veterinaria.backend.sales.model.*;
import com.veterinaria.backend.sales.repository.InvoiceRepository;
import com.veterinaria.backend.sales.service.InventoryMovementService;
import com.veterinaria.backend.sales.service.LotDeduction;
import com.veterinaria.backend.sales.service.SalesService;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import com.veterinaria.backend.veterinarian.repository.VeterinarianRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SalesServiceImpl implements SalesService {

    private final InvoiceRepository invoiceRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryMovementService inventoryMovementService;
    private final UserRepository userRepository;
    private final OwnerRepository ownerRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final InvoiceMapper invoiceMapper;

    private static final BigDecimal PAYMENT_TOLERANCE = BigDecimal.valueOf(0.05);

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<InvoiceDTO> getAllInvoices(InvoiceRequestDTO request) {
        Specification<Invoice> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(request.getSearch())) {
                String searchLike = "%" + request.getSearch().toLowerCase().trim() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("invoiceNumber")), searchLike),
                        cb.like(cb.lower(root.get("notes")), searchLike)
                ));
            }

            if (StringUtils.hasText(request.getSeries())) {
                predicates.add(cb.equal(root.get("series"), request.getSeries()));
            }

            if (StringUtils.hasText(request.getInvoiceType())) {
                predicates.add(cb.equal(root.get("invoiceType"), request.getInvoiceType()));
            }

            if (StringUtils.hasText(request.getPaymentStatus())) {
                predicates.add(cb.equal(root.get("paymentStatus"), request.getPaymentStatus()));
            }

            if (request.getOwnerId() != null) {
                predicates.add(cb.equal(root.get("owner").get("id"), request.getOwnerId()));
            }

            if (request.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("issuedAt"), request.getStartDate()));
            }

            if (request.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("issuedAt"), request.getEndDate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        int limit = request.getLimit() > 0 ? request.getLimit() : 10;
        int pageNumber = request.getOffset() / limit;
        PageRequest pageRequest = PageRequest.of(pageNumber, limit, Sort.by(Sort.Direction.DESC, "issuedAt"));

        Page<Invoice> pageResult = invoiceRepository.findAll(spec, pageRequest);
        List<InvoiceDTO> dtos = pageResult.getContent().stream()
                .map(invoiceMapper::toDTO)
                .toList();

        return PaginatedResponse.<InvoiceDTO>builder()
                .count(pageResult.getTotalElements())
                .results(dtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceById(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Comprobante de venta no encontrado."));
        return invoiceMapper.toDTO(invoice);
    }

    @Override
    @Transactional
    public InvoiceDTO createInvoice(CreateInvoiceDTO dto, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException("Usuario emisor no encontrado."));

        String invoiceType = StringUtils.hasText(dto.getInvoiceType()) ? dto.getInvoiceType().toLowerCase() : "boleta";
        String series = StringUtils.hasText(dto.getSeries()) ? dto.getSeries().toUpperCase() : getDefaultSeries(invoiceType);

        int correlative = invoiceRepository.findMaxCorrelativeBySeries(series).orElse(0) + 1;
        String invoiceNumber = String.format("%s-%08d", series, correlative);

        Owner owner = null;
        if (dto.getOwnerId() != null) {
            owner = ownerRepository.findById(dto.getOwnerId())
                    .orElseThrow(() -> new NotFoundException("Propietario/Cliente no encontrado."));
        }

        Veterinarian veterinarian = null;
        if (dto.getVeterinarianId() != null) {
            veterinarian = veterinarianRepository.findById(dto.getVeterinarianId())
                    .orElseThrow(() -> new NotFoundException("Veterinario referente no encontrado."));
        }

        Invoice invoice = Invoice.builder()
                .series(series)
                .correlative(correlative)
                .invoiceNumber(invoiceNumber)
                .invoiceType(invoiceType)
                .owner(owner)
                .appointmentId(dto.getAppointmentId())
                .veterinarian(veterinarian)
                .paymentStatus("pagado")
                .subtotal(BigDecimal.ZERO)
                .discount(dto.getGlobalDiscount() != null ? dto.getGlobalDiscount() : BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .notes(dto.getNotes())
                .user(currentUser)
                .issuedAt(Instant.now())
                .items(new ArrayList<>())
                .payments(new ArrayList<>())
                .build();

        BigDecimal itemsSubtotalSum = BigDecimal.ZERO;
        BigDecimal itemsDiscountSum = BigDecimal.ZERO;

        for (CreateInvoiceItemDTO itemDto : dto.getItems()) {
            // Constraint check: XOR between variantId and serviceName
            boolean hasVariant = itemDto.getVariantId() != null;
            boolean hasService = StringUtils.hasText(itemDto.getServiceName());
            if ((hasVariant && hasService) || (!hasVariant && !hasService)) {
                throw new BusinessException("Cada ítem debe corresponder a un Producto (variante) O a un Servicio, no ambos ni ninguno.");
            }

            BigDecimal qty = itemDto.getQuantity();
            BigDecimal itemDiscount = itemDto.getDiscount() != null ? itemDto.getDiscount() : BigDecimal.ZERO;

            ProductVariant variant = null;
            String description = itemDto.getDescription();
            BigDecimal unitPrice;

            if (hasVariant) {
                // findByIdForUpdate toma un bloqueo pesimista sobre la fila de la variante,
                // así una segunda venta concurrente del mismo producto espera a que esta
                // transacción confirme (o revierta) antes de leer/validar su stock.
                variant = variantRepository.findByIdForUpdate(itemDto.getVariantId())
                        .orElseThrow(() -> new NotFoundException("Variante de producto no encontrada."));

                if (!Boolean.TRUE.equals(variant.getIsActive())) {
                    throw new BusinessException("El producto/variante '" + variant.getName() + "' está inactivo.");
                }

                if (!StringUtils.hasText(description)) {
                    String prodName = variant.getProduct() != null ? variant.getProduct().getName() : "";
                    description = (prodName + " - " + variant.getName()).trim();
                }

                // El precio unitario de un producto del catálogo siempre se toma del catálogo
                // (variant.salePrice), nunca del valor enviado por el cliente, para evitar
                // que la API pueda usarse para facturar a un precio arbitrario.
                unitPrice = variant.getSalePrice();

                // Check overall stock
                BigDecimal currentStock = BigDecimal.valueOf(variant.getStock() != null ? variant.getStock() : 0);
                if (currentStock.compareTo(qty) < 0) {
                    throw new BusinessException("Stock insuficiente para '" + description + "'. Disponible: " + currentStock + ", Solicitado: " + qty);
                }
            } else {
                if (!StringUtils.hasText(description)) {
                    description = itemDto.getServiceName();
                }
                // Los servicios (sin variante de catálogo) no tienen precio de referencia,
                // así que se confía en el precio indicado por el cliente para este ítem.
                unitPrice = itemDto.getUnitPrice();
            }

            BigDecimal lineSubtotal = unitPrice.multiply(qty).subtract(itemDiscount).setScale(2, RoundingMode.HALF_UP);

            itemsSubtotalSum = itemsSubtotalSum.add(unitPrice.multiply(qty));
            itemsDiscountSum = itemsDiscountSum.add(itemDiscount);

            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .variant(variant)
                    .prescriptionId(itemDto.getPrescriptionId())
                    .serviceName(itemDto.getServiceName())
                    .description(description)
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .discount(itemDiscount)
                    .subtotal(lineSubtotal)
                    .itemLots(new ArrayList<>())
                    .build();

            // Perform FEFO stock deduction if product variant
            if (variant != null) {
                deductStockFEFO(variant, qty, item, currentUser);
            }

            invoice.getItems().add(item);
        }

        BigDecimal globalDiscount = dto.getGlobalDiscount() != null ? dto.getGlobalDiscount() : BigDecimal.ZERO;
        BigDecimal totalDiscount = itemsDiscountSum.add(globalDiscount);

        BigDecimal calculatedSubtotal = itemsSubtotalSum.subtract(totalDiscount).setScale(2, RoundingMode.HALF_UP);
        if (calculatedSubtotal.compareTo(BigDecimal.ZERO) < 0) {
            calculatedSubtotal = BigDecimal.ZERO;
        }

        // IGV / Tax (18% included or calculated as subtotal * 0.18)
        BigDecimal total = calculatedSubtotal;
        BigDecimal subtotalBeforeTax = total.divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
        BigDecimal tax = total.subtract(subtotalBeforeTax);

        invoice.setSubtotal(subtotalBeforeTax);
        invoice.setDiscount(totalDiscount);
        invoice.setTax(tax);
        invoice.setTotal(total);

        // Registrar los pagos recibidos al momento de la venta. La lista puede venir
        // vacía (venta al crédito) o cubrir solo una parte del total (abono inicial);
        // el saldo pendiente se cobra después mediante registerPayment().
        BigDecimal totalPaymentsSum = BigDecimal.ZERO;
        for (CreateInvoicePaymentDTO paymentDto : dto.getPayments()) {
            InvoicePayment payment = InvoicePayment.builder()
                    .invoice(invoice)
                    .paymentMethod(paymentDto.getPaymentMethod().toLowerCase())
                    .amount(paymentDto.getAmount())
                    .referenceNumber(paymentDto.getReferenceNumber())
                    .build();

            totalPaymentsSum = totalPaymentsSum.add(paymentDto.getAmount());
            invoice.getPayments().add(payment);
        }

        if (totalPaymentsSum.subtract(total).compareTo(PAYMENT_TOLERANCE) > 0) {
            throw new BusinessException(String.format("El monto total pagado (S/. %.2f) excede el total del comprobante (S/. %.2f).", totalPaymentsSum, total));
        }
        invoice.setPaymentStatus(computePaymentStatus(totalPaymentsSum, total));

        Invoice savedInvoice = invoiceRepository.saveAndFlush(invoice);
        return invoiceMapper.toDTO(savedInvoice);
    }

    @Override
    @Transactional
    public InvoiceDTO registerPayment(UUID invoiceId, CreateInvoicePaymentDTO dto) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new NotFoundException("Comprobante de venta no encontrado."));

        if ("anulado".equalsIgnoreCase(invoice.getPaymentStatus())) {
            throw new BusinessException("No se pueden registrar pagos sobre un comprobante anulado.");
        }

        BigDecimal currentPaid = invoice.getPayments().stream()
                .map(InvoicePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal newTotalPaid = currentPaid.add(dto.getAmount());

        if (newTotalPaid.subtract(invoice.getTotal()).compareTo(PAYMENT_TOLERANCE) > 0) {
            BigDecimal remaining = invoice.getTotal().subtract(currentPaid).setScale(2, RoundingMode.HALF_UP);
            throw new BusinessException(String.format("El monto excede el saldo pendiente del comprobante. Saldo actual: S/. %.2f", remaining));
        }

        InvoicePayment payment = InvoicePayment.builder()
                .invoice(invoice)
                .paymentMethod(dto.getPaymentMethod().toLowerCase())
                .amount(dto.getAmount())
                .referenceNumber(dto.getReferenceNumber())
                .build();
        invoice.getPayments().add(payment);
        invoice.setPaymentStatus(computePaymentStatus(newTotalPaid, invoice.getTotal()));

        // invoice ya está managed (viene de findById): usar flush() directo en vez de
        // saveAndFlush() evita un merge() innecesario, que cascadearía la persistencia
        // del pago nuevo sobre una copia interna en vez de mutar esta misma instancia
        // (dejando su id/createdAt en null).
        entityManager.flush();

        return invoiceMapper.toDTO(invoice);
    }

    private String computePaymentStatus(BigDecimal amountPaid, BigDecimal total) {
        if (amountPaid.compareTo(BigDecimal.ZERO) <= 0) {
            return "pendiente";
        }
        if (total.subtract(amountPaid).compareTo(PAYMENT_TOLERANCE) <= 0) {
            return "pagado";
        }
        return "parcial";
    }

    private void deductStockFEFO(ProductVariant variant, BigDecimal totalQtyNeeded, InvoiceItem item, User user) {
        List<LotDeduction> deductions = inventoryMovementService.consumeStock(
                variant,
                totalQtyNeeded,
                "venta",
                "invoice",
                item.getInvoice().getId(),
                "Venta registrada comprobante N° " + item.getInvoice().getInvoiceNumber(),
                user
        );

        for (LotDeduction deduction : deductions) {
            InvoiceItemLot itemLot = InvoiceItemLot.builder()
                    .invoiceItem(item)
                    .lot(deduction.lot())
                    .quantity(deduction.quantityDeducted())
                    .build();
            item.getItemLots().add(itemLot);
        }
    }

    private String getDefaultSeries(String invoiceType) {
        return switch (invoiceType.toLowerCase()) {
            case "factura" -> "F001";
            case "ticket" -> "T001";
            default -> "B001";
        };
    }
}
