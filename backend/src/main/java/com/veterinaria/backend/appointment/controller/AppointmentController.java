package com.veterinaria.backend.appointment.controller;

import com.veterinaria.backend.appointment.dto.AppointmentDTO;
import com.veterinaria.backend.appointment.dto.CreateAppointmentDTO;
import com.veterinaria.backend.appointment.dto.UpdateAppointmentDTO;
import com.veterinaria.backend.appointment.service.AppointmentService;
import com.veterinaria.backend.common.dto.MessageResponse;
import com.veterinaria.backend.common.dto.PaginatedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment / scheduling management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    @PreAuthorize("hasAuthority('APPOINTMENTS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get appointments paginated", description = "Get list of appointments with optional date, veterinarian, pet or status filters")
    public ResponseEntity<PaginatedResponse<AppointmentDTO>> getAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID veterinarianId,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        int pageNumber = limit > 0 ? offset / limit : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, limit, Sort.by(Sort.Direction.DESC, "date", "startTime"));
        Page<AppointmentDTO> pageResult = appointmentService.getAllAppointmentsPaginated(date, from, to, veterinarianId, petId, status, pageRequest);

        return ResponseEntity.ok(PaginatedResponse.<AppointmentDTO>builder()
                .count(pageResult.getTotalElements())
                .next(pageResult.hasNext() ? "?limit=" + limit + "&offset=" + (offset + limit) : null)
                .previous(pageResult.hasPrevious() ? "?limit=" + limit + "&offset=" + Math.max(0, offset - limit) : null)
                .results(pageResult.getContent())
                .build());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('APPOINTMENTS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get all appointments", description = "Get list of appointments without pagination (useful for calendar views)")
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID veterinarianId,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(appointmentService.getAllAppointments(date, from, to, veterinarianId, petId, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('APPOINTMENTS_READ') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Get appointment by ID", description = "Get details of a specific appointment")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('APPOINTMENTS_CREATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Create appointment", description = "Schedule a new appointment")
    public ResponseEntity<AppointmentDTO> createAppointment(@Valid @RequestBody CreateAppointmentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.createAppointment(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('APPOINTMENTS_UPDATE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Update appointment", description = "Update details or status of an existing appointment")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable UUID id, @Valid @RequestBody UpdateAppointmentDTO dto) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('APPOINTMENTS_DELETE') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    @Operation(summary = "Cancel appointment", description = "Cancel an appointment (soft delete)")
    public ResponseEntity<MessageResponse> cancelAppointment(@PathVariable UUID id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(new MessageResponse("Cita cancelada exitosamente"));
    }
}
