package com.veterinaria.backend.administrative.repository;

import com.veterinaria.backend.administrative.model.AdministrativeArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdministrativeAreaRepository extends JpaRepository<AdministrativeArea, UUID> {

    boolean existsByName(String name);

    Optional<AdministrativeArea> findByName(String name);

    @Query("SELECT COUNT(a) FROM AdministrativeStaff a WHERE a.assignedArea.id = :areaId AND a.user.isActive = true")
    long countStaffByAreaId(@Param("areaId") UUID areaId);

    @Query("SELECT DISTINCT CONCAT(COALESCE(u.firstName, ''), ' ', COALESCE(u.lastName, ''), ' (@', u.username, ')') " +
           "FROM AdministrativeStaff a JOIN a.user u " +
           "WHERE a.assignedArea.id = :areaId AND u.isActive = true")
    List<String> findAssignedStaffNames(@Param("areaId") UUID areaId);
}
