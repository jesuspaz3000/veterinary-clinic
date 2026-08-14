package com.veterinaria.backend.administrative.repository;

import com.veterinaria.backend.administrative.model.AdministrativeStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdministrativeStaffRepository extends JpaRepository<AdministrativeStaff, UUID>, JpaSpecificationExecutor<AdministrativeStaff> {

    Optional<AdministrativeStaff> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
}
