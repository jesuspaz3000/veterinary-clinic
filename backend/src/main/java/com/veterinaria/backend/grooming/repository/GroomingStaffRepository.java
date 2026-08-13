package com.veterinaria.backend.grooming.repository;

import com.veterinaria.backend.grooming.model.GroomingStaff;
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
public interface GroomingStaffRepository extends JpaRepository<GroomingStaff, UUID> {

    Optional<GroomingStaff> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    List<GroomingStaff> findByStatus(String status);

    @Query("SELECT g FROM GroomingStaff g WHERE g.status = 'activo'")
    List<GroomingStaff> findAllActive();

    @Query("SELECT DISTINCT g FROM GroomingStaff g JOIN g.user u LEFT JOIN g.specialties s WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<GroomingStaff> search(@Param("search") String search, Pageable pageable);

    @Query("SELECT DISTINCT g FROM GroomingStaff g JOIN g.user u LEFT JOIN g.specialties s WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<GroomingStaff> searchList(@Param("search") String search);
}
