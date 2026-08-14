package com.veterinaria.backend.clinicalhistory.service;

import com.veterinaria.backend.clinicalhistory.dto.ClinicalHistoryEntryDTO;

import java.util.List;
import java.util.UUID;

public interface ClinicalHistoryService {

    List<ClinicalHistoryEntryDTO> getClinicalHistory(UUID petId);
}
