package com.veterinaria.backend.surgery.repository;

import com.veterinaria.backend.surgery.model.SurgeryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SurgeryRecordRepository extends JpaRepository<SurgeryRecord, UUID>, JpaSpecificationExecutor<SurgeryRecord> {

    List<SurgeryRecord> findByPetIdAndIsActiveTrueOrderBySurgeryDateDesc(UUID petId);

    // Cirugías activas y no terminales (programada/en_proceso) donde el veterinario
    // participa como cirujano principal o como asistente; usado para detectar choques de horario.
    @Query("SELECT s FROM SurgeryRecord s WHERE s.isActive = true AND s.status IN ('programada', 'en_proceso') " +
            "AND (s.veterinarian.id = :vetId OR s.assistantVeterinarian.id = :vetId)")
    List<SurgeryRecord> findActiveNonTerminalByVeterinarianOrAssistant(@Param("vetId") UUID vetId);
}
