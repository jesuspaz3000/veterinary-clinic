package com.veterinaria.backend.administrative.repository;

import com.veterinaria.backend.administrative.model.AdministrativePosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface AdministrativePositionRepository extends JpaRepository<AdministrativePosition, UUID> {

    boolean existsByName(String name);

    Optional<AdministrativePosition> findByName(String name);

    Set<AdministrativePosition> findByIdIn(List<UUID> ids);

    @Query("SELECT COUNT(a) FROM AdministrativeStaff a JOIN a.positions p WHERE p.id = :positionId AND a.user.isActive = true")
    long countStaffByPositionId(@Param("positionId") UUID positionId);

    @Query("SELECT DISTINCT CONCAT(COALESCE(u.firstName, ''), ' ', COALESCE(u.lastName, ''), ' (@', u.username, ')') " +
           "FROM AdministrativeStaff a JOIN a.user u JOIN a.positions p " +
           "WHERE p.id = :positionId AND u.isActive = true")
    List<String> findAssignedStaffNames(@Param("positionId") UUID positionId);
}
