package com.veterinaria.backend.specialty.repository;

import com.veterinaria.backend.specialty.model.Specialty;
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
public interface SpecialtyRepository extends JpaRepository<Specialty, UUID> {

    Optional<Specialty> findByName(String name);

    boolean existsByName(String name);

    Set<Specialty> findByIdIn(Collection<UUID> ids);

    @Query("SELECT COUNT(v) FROM Veterinarian v JOIN v.specialties s WHERE s.id = :specialtyId")
    long countVeterinariansBySpecialtyId(@Param("specialtyId") UUID specialtyId);

    @Query("SELECT TRIM(CONCAT(COALESCE(u.firstName, ''), ' ', COALESCE(u.lastName, '')))" +
           " FROM Veterinarian v JOIN v.user u JOIN v.specialties s WHERE s.id = :specialtyId")
    List<String> findAssignedVeterinarianNames(@Param("specialtyId") UUID specialtyId);
}
