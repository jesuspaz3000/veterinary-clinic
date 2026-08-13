package com.veterinaria.backend.pet.repository;

import com.veterinaria.backend.pet.model.Pet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PetRepository extends JpaRepository<Pet, UUID> {

    boolean existsByMicrochipNumber(String microchipNumber);

    Optional<Pet> findByMicrochipNumber(String microchipNumber);

    long countByOwnerIdAndStatus(UUID ownerId, String status);

    List<Pet> findByOwnerIdAndStatus(UUID ownerId, String status);

    @Query("SELECT p FROM Pet p JOIN p.owner o WHERE p.status = 'activo' AND (" +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.species) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(COALESCE(p.breed, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(COALESCE(p.microchipNumber, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(COALESCE(o.documentNumber, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Pet> searchActive(@Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Pet p JOIN p.owner o WHERE p.status = 'activo' AND (" +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.species) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(COALESCE(p.breed, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(COALESCE(p.microchipNumber, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(COALESCE(o.documentNumber, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Pet> searchActiveList(@Param("search") String search);

    @Query("SELECT p FROM Pet p WHERE p.status = 'activo'")
    List<Pet> findAllActive();

    @Query("SELECT p FROM Pet p WHERE p.status = 'activo'")
    Page<Pet> findAllActivePaginated(Pageable pageable);

    @Query("SELECT p FROM Pet p WHERE p.owner.id = :ownerId AND p.status = 'activo'")
    Page<Pet> findByOwnerIdPaginated(@Param("ownerId") UUID ownerId, Pageable pageable);
}
