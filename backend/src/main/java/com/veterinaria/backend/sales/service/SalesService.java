package com.veterinaria.backend.sales.service;

import com.veterinaria.backend.common.dto.PaginatedResponse;
import com.veterinaria.backend.sales.dto.CreateInvoiceDTO;
import com.veterinaria.backend.sales.dto.InvoiceDTO;
import com.veterinaria.backend.sales.dto.InvoiceRequestDTO;

import java.util.UUID;

public interface SalesService {
    PaginatedResponse<InvoiceDTO> getAllInvoices(InvoiceRequestDTO request);
    InvoiceDTO getInvoiceById(UUID id);
    InvoiceDTO createInvoice(CreateInvoiceDTO dto, UUID currentUserId);
}
