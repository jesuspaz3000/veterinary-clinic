"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderMultiSectionDigitalClockTimeView } from "@mui/x-date-pickers/timeViewRenderers";
import dayjs, { Dayjs } from "dayjs";
import { SchedulesService } from "../service/schedules.service";
import {
  DAY_OF_WEEK_LABELS,
  ScheduleProfessionalKind,
  ScheduleResponse,
  WEEK_DAYS_ORDERED,
} from "../type/schedulesTypes";

/** Parsea "HH:mm:ss" a Dayjs usando una fecha base (evita depender de plugins de dayjs) */
const parseTime = (time: string): Dayjs => dayjs(`2000-01-01T${time}`);

/** Límites del día para los selectores de hora (00:00–23:59) */
const DAY_MIN = parseTime("00:00:00");
const DAY_MAX = parseTime("23:59:59");

interface ScheduleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kind: ScheduleProfessionalKind;
  professionalId: string;
  /** Horario a editar; null/undefined = modo creación */
  schedule?: ScheduleResponse | null;
  /** Días que ya tienen horario registrado (para bloquearlos al crear) */
  usedDays: number[];
  /** Día preseleccionado (ej. al hacer clic en una franja del calendario) */
  initialDayOfWeek?: number | null;
  /** Hora de inicio preseleccionada en formato HH:mm */
  initialTime?: string | null;
  /** Si se indica, muestra el botón Eliminar en modo edición */
  onDelete?: (schedule: ScheduleResponse) => void;
}

export default function ScheduleFormDialog({
  open,
  onClose,
  onSuccess,
  kind,
  professionalId,
  schedule = null,
  usedDays,
  initialDayOfWeek = null,
  initialTime = null,
  onDelete,
}: ScheduleFormDialogProps) {
  const isEditing = schedule !== null;

  const [dayOfWeek, setDayOfWeek] = useState<number | "">(
    schedule?.dayOfWeek ?? initialDayOfWeek ?? ""
  );
  const [startTime, setStartTime] = useState<Dayjs | null>(
    schedule ? parseTime(schedule.startTime) : initialTime ? parseTime(`${initialTime}:00`) : null
  );
  const [endTime, setEndTime] = useState<Dayjs | null>(
    schedule
      ? parseTime(schedule.endTime)
      : initialTime
        ? parseTime(`${initialTime}:00`).add(1, "hour")
        : null
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(schedule?.isAvailable ?? true);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (dayOfWeek === "") {
      setErrorMessage("Selecciona el día de la semana.");
      return;
    }
    if (!startTime) {
      setErrorMessage("Selecciona la hora de inicio.");
      return;
    }
    if (!endTime) {
      setErrorMessage("Selecciona la hora de fin.");
      return;
    }
    if (!startTime.isBefore(endTime)) {
      setErrorMessage("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    try {
      const request = {
        dayOfWeek,
        startTime: startTime.format("HH:mm:ss"),
        endTime: endTime.format("HH:mm:ss"),
        isAvailable,
      };

      if (isEditing) {
        await SchedulesService.updateSchedule(kind, schedule.id, request);
      } else {
        await SchedulesService.createSchedule(kind, professionalId, request);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Ocurrió un error al guardar el horario."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? "Editar horario" : "Agregar horario"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            select
            label="Día de la semana"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            disabled={saving}
            fullWidth
          >
            {WEEK_DAYS_ORDERED.map((day) => {
              const isUsed = usedDays.includes(day) && day !== schedule?.dayOfWeek;
              return (
                <MenuItem key={day} value={day} disabled={isUsed}>
                  {DAY_OF_WEEK_LABELS[day]}
                  {isUsed ? " (ya registrado)" : ""}
                </MenuItem>
              );
            })}
          </TextField>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TimePicker
              label="Hora inicio"
              value={startTime}
              onChange={(newValue: Dayjs | null) => setStartTime(newValue)}
              minTime={DAY_MIN}
              maxTime={DAY_MAX}
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
              label="Hora fin"
              value={endTime}
              onChange={(newValue: Dayjs | null) => setEndTime(newValue)}
              minTime={startTime ?? DAY_MIN}
              maxTime={DAY_MAX}
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

          <FormControlLabel
            control={
              <Switch
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                disabled={saving}
              />
            }
            label="Disponible para citas"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {isEditing && onDelete && (
          <Button
            color="error"
            onClick={() => onDelete(schedule)}
            disabled={saving}
            sx={{ textTransform: "none", mr: "auto" }}
          >
            Eliminar
          </Button>
        )}
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
