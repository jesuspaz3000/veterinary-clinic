"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import WeeklyCalendar, { getWeekStart } from "@/shared/components/WeeklyCalendar";
import { useAuthStore } from "@/store/auth.store";
import { PERMISSIONS } from "@/shared/config/permissions";
import { VeterinariansService } from "@/features/veterinarians/service/veterinarians.service";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";
import { GroomingService } from "@/features/grooming/service/grooming.service";
import { GroomingStaffResponse } from "@/features/grooming/type/groomingTypes";
import { getUserDisplayName } from "@/features/appointments/utils/professionals";
import { useSchedules } from "../hooks/useSchedules";
import { SchedulesService } from "../service/schedules.service";
import {
  DAY_OF_WEEK_LABELS,
  SCHEDULE_STATUS_FILTERS,
  ScheduleProfessionalKind,
  ScheduleResponse,
  ScheduleStatusFilter,
} from "../type/schedulesTypes";
import ScheduleFormDialog from "./ScheduleFormDialog";

interface ProfessionalItem {
  id: string;
  label: string;
}

/** Horario recurrente proyectado a la fecha de la semana visible del calendario */
type ScheduleCalendarEvent = ScheduleResponse & { date: string };

export default function SchedulesManager() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.SCHEDULES.CREATE);
  const canUpdate = hasPermission(PERMISSIONS.SCHEDULES.UPDATE);
  const canDelete = hasPermission(PERMISSIONS.SCHEDULES.DELETE);

  const [kind, setKind] = useState<ScheduleProfessionalKind>("veterinarian");
  const [vets, setVets] = useState<VeterinarianResponse[]>([]);
  const [groomers, setGroomers] = useState<GroomingStaffResponse[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalItem | null>(null);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ScheduleStatusFilter>("activo");
  // Días ya registrados (activos o no) para bloquearlos al crear, independiente del filtro visible
  const [allDaysTaken, setAllDaysTaken] = useState<number[]>([]);

  const { schedules, loading, error, fetchSchedules, clearSchedules } = useSchedules();

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleResponse | null>(null);
  const [slotPrefill, setSlotPrefill] = useState<{ dayOfWeek: number; time: string } | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<ScheduleResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reactivatingSchedule, setReactivatingSchedule] = useState<ScheduleResponse | null>(null);
  const [reactivating, setReactivating] = useState(false);
  const [reactivateError, setReactivateError] = useState<string | null>(null);

  // Los horarios son recurrentes: el calendario solo usa el lunes de la semana
  // actual como referencia para posicionar los días (sin navegación por semanas)
  const weekStart = useMemo(() => getWeekStart(dayjs()), []);

  useEffect(() => {
    const loadProfessionals = async () => {
      setLoadingProfessionals(true);
      try {
        const [vetsData, groomersData] = await Promise.all([
          VeterinariansService.getAllVeterinarians(),
          GroomingService.getAllGroomingStaff(),
        ]);
        setVets(vetsData?.results || []);
        setGroomers(groomersData?.results || []);
      } catch (err) {
        console.error("Error loading professionals:", err);
      } finally {
        setLoadingProfessionals(false);
      }
    };
    void loadProfessionals();
  }, []);

  const professionalOptions = useMemo<ProfessionalItem[]>(() => {
    if (kind === "veterinarian") {
      return vets.map((v) => ({ id: v.id, label: getUserDisplayName(v.user, "Veterinario") }));
    }
    return groomers.map((g) => ({ id: g.id, label: getUserDisplayName(g.user, "Grooming") }));
  }, [kind, vets, groomers]);

  // Proyecta cada horario (dayOfWeek: 0=Domingo..6=Sábado) a la fecha de la
  // semana visible: la columna del lunes es weekStart, así que el desplazamiento
  // desde el lunes es (dayOfWeek + 6) % 7
  const calendarEvents = useMemo<ScheduleCalendarEvent[]>(
    () =>
      schedules.map((s) => ({
        ...s,
        date: weekStart.add((s.dayOfWeek + 6) % 7, "day").format("YYYY-MM-DD"),
      })),
    [schedules, weekStart]
  );

  const refresh = () => {
    if (selectedProfessional) {
      void fetchSchedules(kind, selectedProfessional.id, statusFilter);
      void refreshAllDaysTaken(selectedProfessional.id);
    }
  };

  // Días con horario registrado (activo o inactivo): se usa para bloquear el
  // día en el formulario de creación sin importar el filtro de estado visible
  const refreshAllDaysTaken = async (professionalId: string) => {
    try {
      const all = await SchedulesService.getSchedules(kind, professionalId, "todos");
      setAllDaysTaken(all.map((s) => s.dayOfWeek));
    } catch (err) {
      console.error("Error fetching all schedule days:", err);
      setAllDaysTaken([]);
    }
  };

  const handleKindChange = (_event: React.SyntheticEvent, newValue: ScheduleProfessionalKind) => {
    setKind(newValue);
    setSelectedProfessional(null);
    setAllDaysTaken([]);
    clearSchedules();
  };

  const handleProfessionalChange = (_event: unknown, newValue: ProfessionalItem | null) => {
    setSelectedProfessional(newValue);
    if (newValue) {
      void fetchSchedules(kind, newValue.id, statusFilter);
      void refreshAllDaysTaken(newValue.id);
    } else {
      setAllDaysTaken([]);
      clearSchedules();
    }
  };

  const handleStatusFilterChange = (newValue: ScheduleStatusFilter) => {
    setStatusFilter(newValue);
    if (selectedProfessional) {
      void fetchSchedules(kind, selectedProfessional.id, newValue);
    }
  };

  // Clic en una franja vacía: abre el formulario con el día y la hora preseleccionados
  const handleSlotClick = (date: Dayjs, time: string) => {
    if (!canCreate) return;
    // dayjs entrega 0=Domingo..6=Sábado, la misma convención del backend
    setSlotPrefill({ dayOfWeek: date.day(), time });
    setEditingSchedule(null);
    setFormOpen(true);
  };

  // Clic en un horario: si está inactivo, ofrece reactivarlo; si está activo,
  // edita (o pide confirmar eliminación si solo hay permiso de borrado)
  const handleEventClick = (event: ScheduleCalendarEvent) => {
    if (!event.isActive) {
      if (canUpdate) setReactivatingSchedule(event);
      return;
    }
    if (canUpdate) {
      setSlotPrefill(null);
      setEditingSchedule(event);
      setFormOpen(true);
    } else if (canDelete) {
      setDeletingSchedule(event);
    }
  };

  const handleDeleteFromForm = (schedule: ScheduleResponse) => {
    setFormOpen(false);
    setEditingSchedule(null);
    setDeletingSchedule(schedule);
  };

  const handleDelete = async () => {
    if (!deletingSchedule) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await SchedulesService.deleteSchedule(kind, deletingSchedule.id);
      setDeletingSchedule(null);
      refresh();
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Ocurrió un error al eliminar el horario."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleReactivate = async () => {
    if (!reactivatingSchedule) return;
    setReactivating(true);
    setReactivateError(null);
    try {
      await SchedulesService.reactivateSchedule(kind, reactivatingSchedule.id);
      setReactivatingSchedule(null);
      refresh();
    } catch (err: unknown) {
      setReactivateError(
        err instanceof Error ? err.message : "Ocurrió un error al reactivar el horario."
      );
    } finally {
      setReactivating(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Toolbar: tipo de profesional + selección + acción de crear */}
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
            alignItems: "center",
            flex: 1,
          }}
        >
          <Tabs
            value={kind}
            onChange={handleKindChange}
            aria-label="tipo de profesional"
            sx={{
              minHeight: 42,
              "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 42 },
            }}
          >
            <Tab value="veterinarian" label="Veterinarios" />
            <Tab value="grooming" label="Grooming" />
          </Tabs>

          <Autocomplete
            options={professionalOptions}
            value={selectedProfessional}
            onChange={handleProfessionalChange}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={loadingProfessionals}
            disabled={loadingProfessionals}
            size="small"
            sx={{ flex: 1, minWidth: 280, maxWidth: { xs: "100%", md: 440 } }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  kind === "veterinarian"
                    ? "Selecciona un veterinario"
                    : "Selecciona personal de grooming"
                }
              />
            )}
          />

          <TextField
            select
            label="Estado"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as ScheduleStatusFilter)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            {SCHEDULE_STATUS_FILTERS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            disabled={!selectedProfessional}
            onClick={() => {
              setSlotPrefill(null);
              setEditingSchedule(null);
              setFormOpen(true);
            }}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, px: 2.5 }}
          >
            Agregar horario
          </Button>
        )}
      </Box>

      {/* Calendario semanal recurrente */}
      {!selectedProfessional ? (
        <Alert severity="info">
          Selecciona un profesional para ver y gestionar sus horarios de atención.
        </Alert>
      ) : error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <>
          <WeeklyCalendar<ScheduleCalendarEvent>
            weekStart={weekStart}
            recurring
            events={calendarEvents}
            loading={loading}
            startHour={0}
            endHour={24}
            maxHeight={640}
            initialScrollHour={7}
            onSlotClick={canCreate ? handleSlotClick : undefined}
            onEventClick={canUpdate || canDelete ? handleEventClick : undefined}
            renderEvent={(schedule) => (
              <Box
                sx={(theme) => {
                  const color = schedule.isAvailable
                    ? theme.palette.success.main
                    : theme.palette.grey[500];
                  return {
                    height: "100%",
                    borderLeft: `4px solid ${color}`,
                    bgcolor: `${color}22`,
                    px: 1,
                    py: 0.5,
                    overflow: "hidden",
                    opacity: schedule.isActive ? 1 : 0.5,
                    transition: "background-color 0.2s ease",
                    "&:hover": { bgcolor: `${color}40` },
                  };
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
                  }}
                >
                  {schedule.startTime.slice(0, 5)}–{schedule.endTime.slice(0, 5)}
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
                  {!schedule.isActive
                    ? "Inactivo (clic para reactivar)"
                    : schedule.isAvailable
                      ? "Disponible"
                      : "No disponible"}
                </Typography>
              </Box>
            )}
          />

          {/* Leyenda */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Estados:
            </Typography>
            <Chip
              label="Disponible"
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: "6px" }}
            />
            <Chip
              label="No disponible"
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: "6px" }}
            />
            {statusFilter !== "activo" && (
              <Chip
                label="Inactivo"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, borderRadius: "6px", opacity: 0.6 }}
              />
            )}
            {canCreate && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                Tip: haz clic en una franja vacía del calendario para agregar un horario en ese día
                y hora.
              </Typography>
            )}
          </Box>
        </>
      )}

      {/* Dialog de creación/edición */}
      {formOpen && selectedProfessional && (
        <ScheduleFormDialog
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingSchedule(null);
            setSlotPrefill(null);
          }}
          onSuccess={refresh}
          kind={kind}
          professionalId={selectedProfessional.id}
          schedule={editingSchedule}
          usedDays={allDaysTaken}
          initialDayOfWeek={slotPrefill?.dayOfWeek ?? null}
          initialTime={slotPrefill?.time ?? null}
          onDelete={canDelete ? handleDeleteFromForm : undefined}
        />
      )}

      {/* Confirmación de eliminación */}
      <Dialog
        open={deletingSchedule !== null}
        onClose={deleting ? undefined : () => setDeletingSchedule(null)}
        maxWidth="xs"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Eliminar horario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {deleteError && (
              <Alert severity="error" onClose={() => setDeleteError(null)}>
                {deleteError}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              ¿Seguro que deseas eliminar el horario del{" "}
              <strong>{deletingSchedule ? DAY_OF_WEEK_LABELS[deletingSchedule.dayOfWeek] : ""}</strong>
              {deletingSchedule
                ? ` (${deletingSchedule.startTime.slice(0, 5)} — ${deletingSchedule.endTime.slice(0, 5)})`
                : ""}
              ? Esta acción no se puede deshacer.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeletingSchedule(null)}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación de reactivación */}
      <Dialog
        open={reactivatingSchedule !== null}
        onClose={reactivating ? undefined : () => setReactivatingSchedule(null)}
        maxWidth="xs"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Reactivar horario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {reactivateError && (
              <Alert severity="error" onClose={() => setReactivateError(null)}>
                {reactivateError}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              ¿Deseas reactivar el horario del{" "}
              <strong>{reactivatingSchedule ? DAY_OF_WEEK_LABELS[reactivatingSchedule.dayOfWeek] : ""}</strong>
              {reactivatingSchedule
                ? ` (${reactivatingSchedule.startTime.slice(0, 5)} — ${reactivatingSchedule.endTime.slice(0, 5)})`
                : ""}
              ?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setReactivatingSchedule(null)}
            disabled={reactivating}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<RestoreRoundedIcon />}
            onClick={handleReactivate}
            disabled={reactivating}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {reactivating ? "Reactivando..." : "Reactivar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
