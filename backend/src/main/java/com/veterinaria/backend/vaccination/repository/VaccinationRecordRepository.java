package com.veterinaria.backend.vaccination.repository;

import com.veterinaria.backend.vaccination.model.VaccinationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface VaccinationRecordRepository extends JpaRepository<VaccinationRecord, UUID>, JpaSpecificationExecutor<VaccinationRecord> {

    List<VaccinationRecord> findByPetIdAndIsActiveTrueOrderByApplicationDateDesc(UUID petId);

    long countByIsActiveTrueAndNextDoseDateBetween(LocalDate start, LocalDate end);
}
