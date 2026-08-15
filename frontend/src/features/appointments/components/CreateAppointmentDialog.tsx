"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Autocomplete,
  Divider,
  Typography,
  IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderMultiSectionDigitalClockTimeView } from "@mui/x-date-pickers/timeViewRenderers";
import dayjs, { Dayjs } from "dayjs";
import { PetService } from "@/features/pets/service/pets.service";
import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinariansService } from "@/features/veterinarians/service/veterinarians.service";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";
import { GroomingService } from "@/features/grooming/service/grooming.service";
import { GroomingStaffResponse } from "@/features/grooming/type/groomingTypes";
import { AppointmentService } from "../service/appointments.service";
import { AppointmentCreateRequest, SERVICE_TYPE_OPTIONS } from "../type/appointmentsTypes";
import { SchedulesService } from "@/features/schedules/service/schedules.service";
import { ScheduleResponse } from "@/features/schedules/type/schedulesTypes";
import { getUserDisplayName } from "../utils/professionals";
import AppointmentSlotPicker from "./AppointmentSlotPicker";

/** Límites del día para los selectores de hora (00:00–23:59) */
const DAY_MIN = dayjs("2000-01-01T00:00:00");
const DAY_MAX = dayjs("2000-01-01T23:59:59");

/** Parsea "HH:mm:ss" a Dayjs con una fecha base */
const parseTime = (time: string): Dayjs => dayjs(`2000-01-01T${time}`);

/** Minutos desde medianoche, ignorando la fecha (para comparar solo horas de reloj) */
const toMinutesOfDay = (value: Dayjs): number => value.hour() * 60 + value.minute();

interface CreateAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Fecha/hora preseleccionada (ej. al hacer clic en una franja del calendario) */
  initialDate?: Dayjs | null;
  initialTime?: string | null;
}

export default function CreateAppointmentDialog({
  open,
  onClose,
  onSuccess,
  initialDate = null,
  initialTime = null,
}: CreateAppointmentDialogProps) {
  const [pets, setPets] = useState<PetResponse[]>([]);
  const [vets, setVets] = useState<VeterinarianResponse[]>([]);
  const [groomers, setGroomers] = useState<GroomingStaffResponse[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [selectedPet, setSelectedPet] = useState<PetResponse | null>(null);
  const [selectedVet, setSelectedVet] = useState<VeterinarianResponse | null>(null);
  const [selectedGroomer, setSelectedGroomer] = useState<GroomingStaffResponse | null>(null);
  // Si la franja preseleccionada viene de un día pasado, se ajusta a hoy
  const [date, setDate] = useState<Dayjs | null>(
    initialDate && initialDate.isBefore(dayjs(), "day") ? dayjs() : initialDate
  );
  const [startTime, setStartTime] = useState<Dayjs | null>(
    initialTime ? dayjs(initialTime, "HH:mm") : null
  );
  const [endTime, setEndTime] = useState<Dayjs | null>(
    initialTime ? dayjs(initialTime, "HH:mm").add(30, "minute") : null
  );
  const [serviceType, setServiceType] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [professionalSchedule, setProfessionalSchedule] = useState<ScheduleResponse | null>(null);
  const [scheduleFetchFailed, setScheduleFetchFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [petsData, vetsData, groomersData] = await Promise.all([
          PetService.getAllPets(),
          VeterinariansService.getAllVeterinarians(),
          GroomingService.getAllGroomingStaff(),
        ]);
        setPets(petsData || []);
        setVets(vetsData?.results || []);
        setGroomers(groomersData?.results || []);
      } catch (err) {
        console.error("Error loading pets/professionals:", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    void loadOptions();
  }, [open]);

  // Carga el horario semanal del profesional seleccionado para acotar las horas de la cita
  useEffect(() => {
    const professionalId = selectedVet?.id ?? selectedGroomer?.id ?? null;
    const kind = selectedVet ? "veterinarian" : selectedGroomer ? "grooming" : null;
    let cancelled = false;
    const loadSchedule = async () => {
      if (!professionalId || !kind || !date || !date.isValid()) {
        setProfessionalSchedule(null);
        setScheduleFetchFailed(false);
        return;
      }
      try {
        const schedules = await SchedulesService.getSchedules(kind, professionalId);
        if (!cancelled) {
          // dayjs: 0=Domingo..6=Sábado, misma convención del backend
          setProfessionalSchedule(schedules.find((s) => s.dayOfWeek === date.day()) ?? null);
          setScheduleFetchFailed(false);
        }
      } catch (err) {
        console.error("Error loading professional schedule:", err);
        if (!cancelled) {
          setProfessionalSchedule(null);
          setScheduleFetchFailed(true);
        }
      }
    };
    void loadSchedule();
    return () => {
      cancelled = true;
    };
  }, [selectedVet, selectedGroomer, date]);

  const hasProfessional = selectedVet !== null || selectedGroomer !== null;
  const scheduleMin = professionalSchedule ? parseTime(professionalSchedule.startTime) : DAY_MIN;
  const scheduleMax = professionalSchedule ? parseTime(professionalSchedule.endTime) : DAY_MAX;
  // Solo tiene sentido evaluar la disponibilidad cuando ya se eligió una fecha
  const hasDateSelected = date !== null && date.isValid();
  const scheduleBlocksDay =
    hasDateSelected &&
    hasProfessional &&
    !scheduleFetchFailed &&
    (professionalSchedule === null || !professionalSchedule.isAvailable);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPet) {
      setErrorMessage("Debes seleccionar una mascota para la cita.");
      return;
    }
    if (!date || !date.isValid()) {
      setErrorMessage("La fecha de la cita es obligatoria.");
      return;
    }
    if (!startTime || !startTime.isValid() || !endTime || !endTime.isValid()) {
      setErrorMessage("Debes indicar la hora de inicio y de fin.");
      return;
    }
    if (!endTime.isAfter(startTime)) {
      setErrorMessage("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }
    if (scheduleBlocksDay) {
      setErrorMessage("El profesional seleccionado no tiene horario disponible ese día.");
      return;
    }
    if (
      professionalSchedule &&
      (toMinutesOfDay(startTime) < toMinutesOfDay(scheduleMin) || toMinutesOfDay(endTime) > toMinutesOfDay(scheduleMax))
    ) {
      setErrorMessage(
        `La cita debe estar dentro del horario de atención (${professionalSchedule.startTime.slice(0, 5)}–${professionalSchedule.endTime.slice(0, 5)}).`
      );
      return;
    }
    if (!serviceType.trim()) {
      setErrorMessage("El tipo de servicio es obligatorio.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: AppointmentCreateRequest = {
      petId: selectedPet.id,
      veterinarianId: selectedVet?.id || null,
      groomingStaffId: selectedGroomer?.id || null,
      date: date.format("YYYY-MM-DD"),
      startTime: startTime.format("HH:mm:ss"),
      endTime: endTime.format("HH:mm:ss"),
      serviceType: serviceType.trim(),
      notes: notes.trim() || null,
    };

    try {
      await AppointmentService.createAppointment(dto);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error creating appointment:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        err.response?.data?.message || err.message || "Error inesperado al agendar la cita."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Nueva Cita</DialogTitle>
      <IconButton
        aria-label="Cerrar"
        onClick={onClose}
        disabled={saving}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "text.secondary",
        }}
      >
        <CloseRoundedIcon />
      </IconButton>
      <form noValidate onSubmit={(e) => void handleSubmit(e)}>
        <DialogContent sx={{ pt: 1.5, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {scheduleBlocksDay && (
            <Alert severity="warning">
              El profesional seleccionado no tiene horario disponible ese día. Elige otro día u otro
              profesional.
            </Alert>
          )}

          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
            Paciente y Profesional
          </Typography>

          <Autocomplete
            options={pets}
            value={selectedPet}
            onChange={(_e, newValue) => setSelectedPet(newValue)}
            getOptionLabel={(option) =>
              option.owner
                ? `${option.name} (${option.species}) — ${option.owner.fullName}`
                : `${option.name} (${option.species})`
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={loadingOptions}
            disabled={saving}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} label="Mascota / Paciente" placeholder="Busca por nombre..." required />
            )}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Autocomplete
              options={vets}
              value={selectedVet}
              onChange={(_e, newValue) => {
                setSelectedVet(newValue);
                if (newValue) setSelectedGroomer(null);
              }}
              getOptionLabel={(option) => getUserDisplayName(option.user, "Veterinario")}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loadingOptions}
              disabled={saving}
              renderInput={(params) => (
                <TextField {...params} label="Veterinario (opcional)" placeholder="Sin asignar" />
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
              loading={loadingOptions}
              disabled={saving}
              renderInput={(params) => (
                <TextField {...params} label="Grooming (opcional)" placeholder="Sin asignar" />
              )}
            />
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
            Fecha, Hora y Servicio
          </Typography>

          <AppointmentSlotPicker
            selectedVet={selectedVet}
            selectedGroomer={selectedGroomer}
            initialDate={date}
            disabled={saving}
            onSelect={(newDate, newStart, newEnd) => {
              setDate(newDate);
              setStartTime(newStart);
              setEndTime(newEnd);
            }}
          />

          {date && date.isValid() && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textTransform: "capitalize" }}
            >
              Fecha seleccionada: {date.format("dddd, D [de] MMMM [de] YYYY")}
            </Typography>
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TimePicker
              label="Hora inicio (ajuste fino)"
              value={startTime}
              onChange={(newValue: Dayjs | null) => setStartTime(newValue)}
              minTime={scheduleMin}
              maxTime={scheduleMax}
              minutesStep={15}
              disabled={saving}
              viewRenderers={{
                hours: renderMultiSectionDigitalClockTimeView,
                minutes: renderMultiSectionDigitalClockTimeView,
                seconds: renderMultiSectionDigitalClockTimeView,
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TimePicker
              label="Hora fin (ajuste fino)"
              value={endTime}
              onChange={(newValue: Dayjs | null) => setEndTime(newValue)}
              minTime={startTime ?? scheduleMin}
              maxTime={scheduleMax}
              minutesStep={15}
              disabled={saving}
              viewRenderers={{
                hours: renderMultiSectionDigitalClockTimeView,
                minutes: renderMultiSectionDigitalClockTimeView,
                seconds: renderMultiSectionDigitalClockTimeView,
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>

          <Autocomplete
            freeSolo
            options={SERVICE_TYPE_OPTIONS}
            value={serviceType}
            onInputChange={(_e, newValue) => setServiceType(newValue)}
            disabled={saving}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tipo de servicio"
                placeholder="Ej. Consulta general, Vacunación..."
                required
              />
            )}
          />

          <TextField
            label="Notas / Observaciones"
            placeholder="Motivo de la cita, indicaciones..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={saving}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            variant="contained"
            sx={{ borderRadius: "8px", textTransform: "none", minWidth: 130 }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Agendar Cita"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
