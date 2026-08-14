package com.veterinaria.backend.hospitalization.repository;

import com.veterinaria.backend.hospitalization.model.HospitalizationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface HospitalizationRecordRepository extends JpaRepository<HospitalizationRecord, UUID>, JpaSpecificationExecutor<HospitalizationRecord> {
}
