package com.veterinaria.backend.medicalrecord.dto;

import com.veterinaria.backend.pet.dto.PetDTO;
import com.veterinaria.backend.veterinarian.dto.VeterinarianDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordDTO {

    private UUID id;
    private PetDTO pet;
    private VeterinarianDTO veterinarian;
    private UUID appointmentId;
    private String recordType;
    private Instant recordDate;
    private String reason;
    private String symptoms;
    private String diagnosis;
    private String treatment;
    private String observations;
    private BigDecimal weight;
    private BigDecimal temperature;
    private Integer heartRate;
    private Integer respiratoryRate;
    private LocalDate followUpDate;
    private String status;
    private List<PrescriptionDTO> prescriptions;
    private List<MedicalDocumentDTO> documents;
    private Instant createdAt;
    private Instant updatedAt;
}
