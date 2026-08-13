package com.veterinaria.backend.deworming.repository;

import com.veterinaria.backend.deworming.model.DewormingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DewormingRecordRepository extends JpaRepository<DewormingRecord, UUID>, JpaSpecificationExecutor<DewormingRecord> {
}
