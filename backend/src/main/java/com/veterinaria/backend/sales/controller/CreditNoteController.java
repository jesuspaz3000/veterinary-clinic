package com.veterinaria.backend.sales.controller;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.sales.dto.CreateCreditNoteDTO;
import com.veterinaria.backend.sales.dto.CreditNoteDTO;
import com.veterinaria.backend.sales.service.CreditNoteService;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/credit-notes")
@RequiredArgsConstructor
@Tag(name = "Credit Notes", description = "Endpoints for credit notes and invoice cancellations")
@SecurityRequirement(name = "Bearer Authentication")
public class CreditNoteController {

    private final CreditNoteService creditNoteService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('SALES_READ') or hasAuthority('PRODUCTS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get credit notes paginated", description = "Get list of credit notes")
    public ResponseEntity<PaginatedResponse<CreditNoteDTO>> getCreditNotes(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        return ResponseEntity.ok(creditNoteService.getAllCreditNotes(limit, offset));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SALES_READ') or hasAuthority('PRODUCTS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get credit note by ID", description = "Get details of a credit note")
    public ResponseEntity<CreditNoteDTO> getCreditNoteById(@PathVariable UUID id) {
        return ResponseEntity.ok(creditNoteService.getCreditNoteById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SALES_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Issue credit note", description = "Issue a credit note for full or partial invoice return")
    public ResponseEntity<CreditNoteDTO> createCreditNote(@Valid @RequestBody CreateCreditNoteDTO dto, Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(creditNoteService.createCreditNote(dto, currentUser.getId()));
    }

    private User getAuthenticatedUser(Authentication authentication) {
        String principal = authentication.getName();
        return userRepository.findByEmail(principal)
                .or(() -> userRepository.findByUsername(principal))
                .orElseThrow(() -> new NotFoundException("Usuario autenticado no encontrado."));
    }
}
