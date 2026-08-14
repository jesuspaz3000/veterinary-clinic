package com.veterinaria.backend.grooming.repository;

import com.veterinaria.backend.grooming.model.GroomingStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroomingStaffRepository extends JpaRepository<GroomingStaff, UUID>, JpaSpecificationExecutor<GroomingStaff> {

    Optional<GroomingStaff> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}
