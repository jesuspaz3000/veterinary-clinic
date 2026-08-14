package com.veterinaria.backend.veterinarian.repository;

import com.veterinaria.backend.veterinarian.model.Veterinarian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VeterinarianRepository extends JpaRepository<Veterinarian, UUID>, JpaSpecificationExecutor<Veterinarian> {

    // Puente entre auth (user.id) y dominio (veterinarian.id) — lo vas a usar seguido
    Optional<Veterinarian> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);

    // Para validar duplicados al crear/actualizar (tu DBML marca license_number como unique)
    Optional<Veterinarian> findByLicenseNumber(String licenseNumber);
    boolean existsByLicenseNumber(String licenseNumber);

    // Filtrar por especialidad
    @Query("SELECT v FROM Veterinarian v JOIN v.specialties s WHERE LOWER(s.name) = LOWER(:specialtyName)")
    List<Veterinarian> findBySpecialtyName(@Param("specialtyName") String specialtyName);

    @Query("SELECT v FROM Veterinarian v JOIN v.specialties s WHERE s.id = :specialtyId")
    List<Veterinarian> findBySpecialtyId(@Param("specialtyId") UUID specialtyId);
}