package com.veterinaria.backend.appointment.repository;

import com.veterinaria.backend.appointment.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID>, JpaSpecificationExecutor<Appointment> {

    List<Appointment> findByPetIdOrderByDateDescStartTimeDesc(UUID petId);

    long countByDate(LocalDate date);

    List<Appointment> findByDateBetweenOrderByDateAsc(LocalDate start, LocalDate end);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.veterinarian.id = :veterinarianId " +
            "AND a.date = :date AND a.status <> 'cancelada' AND a.id <> :excludeId " +
            "AND a.startTime < :endTime AND a.endTime > :startTime")
    long countOverlappingForVeterinarian(@Param("veterinarianId") UUID veterinarianId,
                                         @Param("date") LocalDate date,
                                         @Param("startTime") LocalTime startTime,
                                         @Param("endTime") LocalTime endTime,
                                         @Param("excludeId") UUID excludeId);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.groomingStaff.id = :groomingStaffId " +
            "AND a.date = :date AND a.status <> 'cancelada' AND a.id <> :excludeId " +
            "AND a.startTime < :endTime AND a.endTime > :startTime")
    long countOverlappingForGroomingStaff(@Param("groomingStaffId") UUID groomingStaffId,
                                          @Param("date") LocalDate date,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime,
                                          @Param("excludeId") UUID excludeId);
}
