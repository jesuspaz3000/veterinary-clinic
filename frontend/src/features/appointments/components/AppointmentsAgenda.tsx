"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Box,
  Button,
  Alert,
  Autocomplete,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import WeeklyCalendar, { getWeekStart } from "@/shared/components/WeeklyCalendar";
import { useAuthStore } from "@/store/auth.store";
import { PERMISSIONS } from "@/shared/config/permissions";
import { VeterinariansService } from "@/features/veterinarians/service/veterinarians.service";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";
import { GroomingService } from "@/features/grooming/service/grooming.service";
import { GroomingStaffResponse } from "@/features/grooming/type/groomingTypes";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentResponse, APPOINTMENT_STATUSES } from "../type/appointmentsTypes";
import { getAppointmentProfessional, getUserDisplayName } from "../utils/professionals";
import AppointmentStatusChip, { getStatusColor } from "./AppointmentStatusChip";
import CreateAppointmentDialog from "./CreateAppointmentDialog";
import EditAppointmentDialog from "./EditAppointmentDialog";
import CancelAppointmentDialog from "./CancelAppointmentDialog";

export default function AppointmentsAgenda() {
  const { weekAppointments, loading, error, fetchWeekAppointments } = useAppointments();
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const [weekStart, setWeekStart] = useState<Dayjs>(() => getWeekStart(dayjs()));
  const [vets, setVets] = useState<VeterinarianResponse[]>([]);
  const [groomers, setGroomers] = useState<GroomingStaffResponse[]>([]);
  const [selectedVet, setSelectedVet] = useState<VeterinarianResponse | null>(null);
  const [selectedGroomer, setSelectedGroomer] = useState<GroomingStaffResponse | null>(null);
  // El skeleton solo se muestra antes de la primera carga; los cambios de semana
  // posteriores atenúan la grilla en vez de reemplazarla (evita el pestañeo)
  const [initialLoading, setInitialLoading] = useState(true);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [slotPrefill, setSlotPrefill] = useState<{ date: Dayjs; time: string } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);

  const refresh = (week: Dayjs) => {
    const dates = Array.from({ length: 7 }, (_, i) => week.add(i, "day").format("YYYY-MM-DD"));
    void fetchWeekAppointments(dates).then(() => setInitialLoading(false));
  };

  useEffect(() => {
    refresh(weekStart);
  }, [weekStart]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        const [vetsData, groomersData] = await Promise.all([
          VeterinariansService.getAllVeterinarians(),
          GroomingService.getAllGroomingStaff(),
        ]);
        setVets(vetsData?.results || []);
        setGroomers(groomersData?.results || []);
      } catch (err) {
        console.error("Error loading professionals:", err);
      }
    };
    void loadProfessionals();
  }, []);

  const filteredEvents = useMemo(() => {
    if (selectedVet) {
      return weekAppointments.filter((a) => a.veterinarian?.id === selectedVet.id);
    }
    if (selectedGroomer) {
      return weekAppointments.filter((a) => a.groomingStaff?.id === selectedGroomer.id);
    }
    return weekAppointments;
  }, [weekAppointments, selectedVet, selectedGroomer]);

  const canCreate = hasPermission(PERMISSIONS.APPOINTMENTS.CREATE);
  const canUpdate = hasPermission(PERMISSIONS.APPOINTMENTS.UPDATE);
  const canDelete = hasPermission(PERMISSIONS.APPOINTMENTS.DELETE);

  const handleSlotClick = (date: Dayjs, time: string) => {
    if (!canCreate) return;
    setSlotPrefill({ date, time });
    setCreateOpen(true);
  };

  const handleEventClick = (event: AppointmentResponse) => {
    setSelectedAppointment(event);
    if (event.status === "cancelada") {
      if (canUpdate) setEditOpen(true);
      return;
    }
    if (canUpdate) {
      setEditOpen(true);
    } else if (canDelete) {
      setCancelOpen(true);
    }
  };

  const handleSuccess = () => {
    refresh(weekStart);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            flex: 1,
            maxWidth: { xs: "100%", md: 640 },
          }}
        >
          <Autocomplete
            options={vets}
            value={selectedVet}
            onChange={(_e, newValue) => {
              setSelectedVet(newValue);
              if (newValue) setSelectedGroomer(null);
            }}
            getOptionLabel={(option) => getUserDisplayName(option.user, "Veterinario")}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            size="small"
            sx={{ flex: { xs: "1 1 100%", sm: 1 }, minWidth: { xs: "auto", sm: 220 } }}
            renderInput={(params) => (
              <TextField {...params} label="Filtrar por veterinario" placeholder="Todos" />
            )}
          />
          <Autocomplete
            options={groomers}
            value={selectedGroomer}
            onChange={(_e, newValue) => {
              setSelectedGroomer(newValue);
              if (newValue) setSelectedVet(null);
            }}
            getOptionLabel={(option) => getUserDisplayName(option.user, "Grooming")}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            size="small"
            sx={{ flex: { xs: "1 1 100%", sm: 1 }, minWidth: { xs: "auto", sm: 220 } }}
            renderInput={(params) => (
              <TextField {...params} label="Filtrar por grooming" placeholder="Todos" />
            )}
          />
        </Box>

        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setSlotPrefill(null);
              setCreateOpen(true);
            }}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Nueva Cita
          </Button>
        )}
      </Box>

      {error && <Alert severity="error">No se pudo cargar la agenda de citas.</Alert>}

      {/* Calendario semanal */}
      <WeeklyCalendar<AppointmentResponse>
        weekStart={weekStart}
        onWeekChange={setWeekStart}
        events={filteredEvents}
        loading={loading && initialLoading}
        refreshing={loading && !initialLoading}
        startHour={0}
        endHour={24}
        maxHeight={640}
        initialScrollHour={8}
        onSlotClick={canCreate ? handleSlotClick : undefined}
        onEventClick={handleEventClick}
        renderEvent={(appointment) => {
          const color = getStatusColor(appointment.status);
          const cancelled = appointment.status === "cancelada";
          const professional = getAppointmentProfessional(appointment);
          return (
            <Box
              sx={{
                height: "100%",
                borderLeft: `4px solid ${color}`,
                bgcolor: `${color}22`,
                px: 1,
                py: 0.5,
                overflow: "hidden",
                opacity: cancelled ? 0.55 : 1,
                transition: "background-color 0.2s ease",
                "&:hover": { bgcolor: `${color}40` },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textDecoration: cancelled ? "line-through" : "none",
                }}
              >
                {appointment.startTime.slice(0, 5)}–{appointment.endTime.slice(0, 5)} —{" "}
                {appointment.pet.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {appointment.serviceType}
                {professional ? ` · ${professional.label}` : ""}
              </Typography>
            </Box>
          );
        }}
      />

      {/* Leyenda de estados */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Estados:
        </Typography>
        {APPOINTMENT_STATUSES.map((s) => (
          <AppointmentStatusChip key={s} status={s} />
        ))}
        {canCreate && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            Tip: haz clic en una franja vacía del calendario para agendar en ese horario.
          </Typography>
        )}
      </Box>

      {/* Dialogs */}
      {createOpen && (
        <CreateAppointmentDialog
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
            setSlotPrefill(null);
          }}
          onSuccess={handleSuccess}
          initialDate={slotPrefill?.date || null}
          initialTime={slotPrefill?.time || null}
        />
      )}

      {editOpen && selectedAppointment && (
        <EditAppointmentDialog
          key={selectedAppointment.id}
          open={editOpen}
          appointmentId={selectedAppointment.id}
          onClose={() => {
            setEditOpen(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {cancelOpen && selectedAppointment && (
        <CancelAppointmentDialog
          open={cancelOpen}
          appointment={selectedAppointment}
          onClose={() => {
            setCancelOpen(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
}
