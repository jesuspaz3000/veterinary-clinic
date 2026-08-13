package com.veterinaria.backend.surgery.repository;

import com.veterinaria.backend.surgery.model.SurgeryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SurgeryRecordRepository extends JpaRepository<SurgeryRecord, UUID>, JpaSpecificationExecutor<SurgeryRecord> {
}
