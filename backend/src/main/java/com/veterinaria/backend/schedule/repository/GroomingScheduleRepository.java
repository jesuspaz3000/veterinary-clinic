package com.veterinaria.backend.schedule.repository;

import com.veterinaria.backend.schedule.model.GroomingSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroomingScheduleRepository extends JpaRepository<GroomingSchedule, UUID> {

    List<GroomingSchedule> findByGroomingStaffIdOrderByDayOfWeekAsc(UUID groomingStaffId);

    List<GroomingSchedule> findByGroomingStaffIdAndIsActiveTrueOrderByDayOfWeekAsc(UUID groomingStaffId);

    List<GroomingSchedule> findByGroomingStaffIdAndIsActiveFalseOrderByDayOfWeekAsc(UUID groomingStaffId);

    Optional<GroomingSchedule> findByGroomingStaffIdAndDayOfWeekAndIsActiveTrue(UUID groomingStaffId, Integer dayOfWeek);

    boolean existsByGroomingStaffIdAndDayOfWeek(UUID groomingStaffId, Integer dayOfWeek);

    boolean existsByGroomingStaffIdAndDayOfWeekAndIdNot(UUID groomingStaffId, Integer dayOfWeek, UUID id);
}
