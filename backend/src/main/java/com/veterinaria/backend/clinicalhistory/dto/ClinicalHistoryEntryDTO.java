package com.veterinaria.backend.clinicalhistory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/** Una entrada de la línea de tiempo del historial clínico de una mascota */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClinicalHistoryEntryDTO {
    // appointment, medical_record, vaccination, deworming, surgery, hospitalization
    private String type;
    private UUID id;
    private Instant date;
    private String title;
    private String subtitle;
    private String status;
    private String description;
}
