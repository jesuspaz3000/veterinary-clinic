package com.veterinaria.backend.schedule.repository;

import com.veterinaria.backend.schedule.model.VeterinarianSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VeterinarianScheduleRepository extends JpaRepository<VeterinarianSchedule, UUID> {

    List<VeterinarianSchedule> findByVeterinarianIdOrderByDayOfWeekAsc(UUID veterinarianId);

    List<VeterinarianSchedule> findByVeterinarianIdAndIsActiveTrueOrderByDayOfWeekAsc(UUID veterinarianId);

    List<VeterinarianSchedule> findByVeterinarianIdAndIsActiveFalseOrderByDayOfWeekAsc(UUID veterinarianId);

    Optional<VeterinarianSchedule> findByVeterinarianIdAndDayOfWeekAndIsActiveTrue(UUID veterinarianId, Integer dayOfWeek);

    boolean existsByVeterinarianIdAndDayOfWeek(UUID veterinarianId, Integer dayOfWeek);

    boolean existsByVeterinarianIdAndDayOfWeekAndIdNot(UUID veterinarianId, Integer dayOfWeek, UUID id);
}
