package com.veterinaria.backend.schedule.controller;

import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.schedule.dto.ScheduleDTO;
import com.veterinaria.backend.schedule.dto.ScheduleRequestDTO;
import com.veterinaria.backend.schedule.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
@Tag(name = "Schedules", description = "Veterinarian and grooming staff work schedule management")
@SecurityRequirement(name = "Bearer Authentication")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/veterinarians/{veterinarianId}")
    @PreAuthorize("hasAuthority('SCHEDULES_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get veterinarian schedules", description = "Get the weekly work schedule of a veterinarian")
    public ResponseEntity<List<ScheduleDTO>> getVeterinarianSchedules(@PathVariable UUID veterinarianId) {
        return ResponseEntity.ok(scheduleService.getVeterinarianSchedules(veterinarianId));
    }

    @GetMapping("/grooming/{groomingStaffId}")
    @PreAuthorize("hasAuthority('SCHEDULES_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get grooming staff schedules", description = "Get the weekly work schedule of a grooming staff member")
    public ResponseEntity<List<ScheduleDTO>> getGroomingSchedules(@PathVariable UUID groomingStaffId) {
        return ResponseEntity.ok(scheduleService.getGroomingSchedules(groomingStaffId));
    }

    @PostMapping("/veterinarians/{veterinarianId}")
    @PreAuthorize("hasAuthority('SCHEDULES_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Create veterinarian schedule", description = "Add a work schedule entry for a veterinarian")
    public ResponseEntity<ScheduleDTO> createVeterinarianSchedule(
            @PathVariable UUID veterinarianId,
            @Valid @RequestBody ScheduleRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.createVeterinarianSchedule(veterinarianId, dto));
    }

    @PostMapping("/grooming/{groomingStaffId}")
    @PreAuthorize("hasAuthority('SCHEDULES_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Create grooming staff schedule", description = "Add a work schedule entry for a grooming staff member")
    public ResponseEntity<ScheduleDTO> createGroomingSchedule(
            @PathVariable UUID groomingStaffId,
            @Valid @RequestBody ScheduleRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.createGroomingSchedule(groomingStaffId, dto));
    }

    @PutMapping("/veterinarians/{scheduleId}")
    @PreAuthorize("hasAuthority('SCHEDULES_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Update veterinarian schedule", description = "Update a veterinarian schedule entry")
    public ResponseEntity<ScheduleDTO> updateVeterinarianSchedule(
            @PathVariable UUID scheduleId,
            @Valid @RequestBody ScheduleRequestDTO dto
    ) {
        return ResponseEntity.ok(scheduleService.updateVeterinarianSchedule(scheduleId, dto));
    }

    @PutMapping("/grooming/{scheduleId}")
    @PreAuthorize("hasAuthority('SCHEDULES_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Update grooming staff schedule", description = "Update a grooming staff schedule entry")
    public ResponseEntity<ScheduleDTO> updateGroomingSchedule(
            @PathVariable UUID scheduleId,
            @Valid @RequestBody ScheduleRequestDTO dto
    ) {
        return ResponseEntity.ok(scheduleService.updateGroomingSchedule(scheduleId, dto));
    }

    @DeleteMapping("/veterinarians/{scheduleId}")
    @PreAuthorize("hasAuthority('SCHEDULES_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Delete veterinarian schedule", description = "Delete a veterinarian schedule entry")
    public ResponseEntity<MessageResponse> deleteVeterinarianSchedule(@PathVariable UUID scheduleId) {
        scheduleService.deleteVeterinarianSchedule(scheduleId);
        return ResponseEntity.ok(new MessageResponse("Horario eliminado exitosamente"));
    }

    @DeleteMapping("/grooming/{scheduleId}")
    @PreAuthorize("hasAuthority('SCHEDULES_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Delete grooming staff schedule", description = "Delete a grooming staff schedule entry")
    public ResponseEntity<MessageResponse> deleteGroomingSchedule(@PathVariable UUID scheduleId) {
        scheduleService.deleteGroomingSchedule(scheduleId);
        return ResponseEntity.ok(new MessageResponse("Horario eliminado exitosamente"));
    }
}
