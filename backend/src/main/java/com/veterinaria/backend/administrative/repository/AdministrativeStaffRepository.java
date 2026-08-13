package com.veterinaria.backend.administrative.repository;

import com.veterinaria.backend.administrative.model.AdministrativeStaff;
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
public interface AdministrativeStaffRepository extends JpaRepository<AdministrativeStaff, UUID> {

    Optional<AdministrativeStaff> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);

    @Query("SELECT DISTINCT a FROM AdministrativeStaff a JOIN a.user u JOIN u.role r LEFT JOIN a.positions p LEFT JOIN a.assignedArea area WHERE " +
            "r.name = 'ADMINISTRATIVE' AND (" +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(area.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AdministrativeStaff> search(@Param("search") String search, Pageable pageable);

    @Query("SELECT DISTINCT a FROM AdministrativeStaff a JOIN a.user u JOIN u.role r LEFT JOIN a.positions p LEFT JOIN a.assignedArea area WHERE " +
            "r.name = 'ADMINISTRATIVE' AND (" +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(area.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<AdministrativeStaff> searchList(@Param("search") String search);

    @Query("SELECT a FROM AdministrativeStaff a JOIN a.user u JOIN u.role r WHERE r.name = 'ADMINISTRATIVE'")
    List<AdministrativeStaff> findAllAdministrative();

    @Query("SELECT a FROM AdministrativeStaff a JOIN a.user u JOIN u.role r WHERE r.name = 'ADMINISTRATIVE'")
    Page<AdministrativeStaff> findAllAdministrativePaginated(Pageable pageable);
}
