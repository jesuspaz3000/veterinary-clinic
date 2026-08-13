package com.veterinaria.backend.sales.service;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.sales.dto.CreateCreditNoteDTO;
import com.veterinaria.backend.sales.dto.CreditNoteDTO;

import java.util.UUID;

public interface CreditNoteService {
    PaginatedResponse<CreditNoteDTO> getAllCreditNotes(int limit, int offset);
    CreditNoteDTO getCreditNoteById(UUID id);
    CreditNoteDTO createCreditNote(CreateCreditNoteDTO dto, UUID currentUserId);
}
