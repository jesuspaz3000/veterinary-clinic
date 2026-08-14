package com.veterinaria.backend.pet.repository;

import com.veterinaria.backend.pet.model.Pet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PetRepository extends JpaRepository<Pet, UUID>, JpaSpecificationExecutor<Pet> {

    boolean existsByMicrochipNumber(String microchipNumber);

    Optional<Pet> findByMicrochipNumber(String microchipNumber);

    long countByOwnerIdAndStatus(UUID ownerId, String status);

    List<Pet> findByOwnerIdAndStatus(UUID ownerId, String status);

    // Usados únicamente por el listado sin paginar (/pets/all, para selects/dropdowns):
    // siempre solo activos, no participan del filtro de estado de la tabla paginada.
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
}
