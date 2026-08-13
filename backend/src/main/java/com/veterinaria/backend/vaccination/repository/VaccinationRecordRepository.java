package com.veterinaria.backend.vaccination.repository;

import com.veterinaria.backend.vaccination.model.VaccinationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VaccinationRecordRepository extends JpaRepository<VaccinationRecord, UUID>, JpaSpecificationExecutor<VaccinationRecord> {
}
