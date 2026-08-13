package com.veterinaria.backend.grooming.repository;

import com.veterinaria.backend.grooming.model.GroomingSpecialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface GroomingSpecialtyRepository extends JpaRepository<GroomingSpecialty, UUID> {

    Optional<GroomingSpecialty> findByName(String name);

    boolean existsByName(String name);

    Set<GroomingSpecialty> findByIdIn(Collection<UUID> ids);

    @Query("SELECT COUNT(g) FROM GroomingStaff g JOIN g.specialties s WHERE s.id = :specialtyId")
    long countGroomingStaffBySpecialtyId(@Param("specialtyId") UUID specialtyId);

    @Query("SELECT TRIM(CONCAT(COALESCE(u.firstName, ''), ' ', COALESCE(u.lastName, '')))" +
           " FROM GroomingStaff g JOIN g.user u JOIN g.specialties s WHERE s.id = :specialtyId")
    List<String> findAssignedStaffNames(@Param("specialtyId") UUID specialtyId);
}
