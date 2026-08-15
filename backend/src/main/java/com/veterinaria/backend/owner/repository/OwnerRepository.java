package com.veterinaria.backend.owner.repository;

import com.veterinaria.backend.owner.model.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, UUID>, JpaSpecificationExecutor<Owner> {

    boolean existsByDocumentNumber(String documentNumber);

    Optional<Owner> findByDocumentNumber(String documentNumber);

    long countByIsActiveTrue();

    // Usados únicamente por el listado sin paginar (/owners/all, para selects/dropdowns):
    // siempre solo activos, no participan del filtro de estado de la tabla paginada.
    @Query("SELECT o FROM Owner o WHERE o.isActive = true AND (" +
            "LOWER(o.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(COALESCE(o.documentNumber, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(COALESCE(o.phone, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(COALESCE(o.email, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Owner> searchActiveList(@Param("search") String search);

    @Query("SELECT o FROM Owner o WHERE o.isActive = true")
    List<Owner> findAllActive();
}
