package com.veterinaria.backend.sales.service;

import com.veterinaria.backend.sales.dto.InvoiceDTO;

public interface InvoicePdfService {
    byte[] generatePdf(InvoiceDTO invoice);
}
