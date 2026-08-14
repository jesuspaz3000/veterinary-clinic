package com.veterinaria.backend.sales.controller;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.sales.dto.CreateInvoiceDTO;
import com.veterinaria.backend.sales.dto.CreateInvoicePaymentDTO;
import com.veterinaria.backend.sales.dto.InvoiceDTO;
import com.veterinaria.backend.sales.dto.InvoiceRequestDTO;
import com.veterinaria.backend.sales.service.SalesService;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
@Tag(name = "Sales & Billing (POS)", description = "Endpoints for invoices, over-the-counter sales, and POS billing")
@SecurityRequirement(name = "Bearer Authentication")
public class SalesController {

    private final SalesService salesService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('SALES_READ') or hasAuthority('PRODUCTS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get invoices paginated", description = "Get list of invoices with filters")
    public ResponseEntity<PaginatedResponse<InvoiceDTO>> getInvoices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String series,
            @RequestParam(required = false) String invoiceType,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) UUID ownerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        InvoiceRequestDTO request = InvoiceRequestDTO.builder()
                .search(search)
                .series(series)
                .invoiceType(invoiceType)
                .paymentStatus(paymentStatus)
                .ownerId(ownerId)
                .startDate(startDate)
                .endDate(endDate)
                .limit(limit)
                .offset(offset)
                .build();

        return ResponseEntity.ok(salesService.getAllInvoices(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SALES_READ') or hasAuthority('PRODUCTS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get invoice by ID", description = "Get details of a specific invoice")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(salesService.getInvoiceById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SALES_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Register sale / invoice", description = "Process a POS sale with automatic FEFO stock deduction")
    public ResponseEntity<InvoiceDTO> createInvoice(@Valid @RequestBody CreateInvoiceDTO dto, Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(salesService.createInvoice(dto, currentUser.getId()));
    }

    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAuthority('SALES_UPDATE') or hasAuthority('SALES_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Register payment", description = "Register an additional payment against an invoice's outstanding balance")
    public ResponseEntity<InvoiceDTO> registerPayment(@PathVariable UUID id, @Valid @RequestBody CreateInvoicePaymentDTO dto) {
        return ResponseEntity.ok(salesService.registerPayment(id, dto));
    }

    private User getAuthenticatedUser(Authentication authentication) {
        String principal = authentication.getName();
        return userRepository.findByEmail(principal)
                .or(() -> userRepository.findByUsername(principal))
                .orElseThrow(() -> new NotFoundException("Usuario autenticado no encontrado."));
    }
}
