package com.veterinaria.backend.hospitalization.repository;

import com.veterinaria.backend.hospitalization.model.HospitalizationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HospitalizationRecordRepository extends JpaRepository<HospitalizationRecord, UUID>, JpaSpecificationExecutor<HospitalizationRecord> {

    List<HospitalizationRecord> findByPetIdAndIsActiveTrueOrderByAdmissionDateDesc(UUID petId);

    long countByStatusAndIsActiveTrue(String status);

    // Evita que una misma mascota tenga dos hospitalizaciones activas simultáneas
    boolean existsByPetIdAndStatusAndIsActiveTrue(UUID petId, String status);
    boolean existsByPetIdAndStatusAndIsActiveTrueAndIdNot(UUID petId, String status, UUID excludeId);

    // Evita que dos mascotas ocupen la misma jaula al mismo tiempo
    boolean existsByCageNumberAndStatusAndIsActiveTrue(String cageNumber, String status);
    boolean existsByCageNumberAndStatusAndIsActiveTrueAndIdNot(String cageNumber, String status, UUID excludeId);
}
