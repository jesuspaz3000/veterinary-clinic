"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Alert, Box, Typography } from "@mui/material";
import WeeklyCalendar, { getWeekStart } from "@/shared/components/WeeklyCalendar";
import { GroomingStaffResponse } from "@/features/grooming/type/groomingTypes";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";
import { SchedulesService } from "@/features/schedules/service/schedules.service";
import { ScheduleResponse } from "@/features/schedules/type/schedulesTypes";
import { AppointmentService } from "../service/appointments.service";
import { AppointmentResponse } from "../type/appointmentsTypes";
import { getStatusColor } from "./AppointmentStatusChip";

const START_HOUR = 0;
const END_HOUR = 24;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;
const SLOT_DURATION = 30;

const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

interface AppointmentSlotPickerProps {
  selectedVet: VeterinarianResponse | null;
  selectedGroomer: GroomingStaffResponse | null;
  /** Fecha ya seleccionada: abre el calendario en esa semana */
  initialDate?: Dayjs | null;
  onSelect: (date: Dayjs, start: Dayjs, end: Dayjs) => void;
  /** Id de la cita en edición para no marcarla como horario ocupado */
  excludeAppointmentId?: string;
  disabled?: boolean;
}

/**
 * Mini-calendario semanal para elegir fecha y hora de la cita según la
 * disponibilidad del profesional: muestra su horario de atención como fondo
 * y sus citas existentes como franjas ocupadas.
 */
export default function AppointmentSlotPicker({
  selectedVet,
  selectedGroomer,
  initialDate = null,
  onSelect,
  excludeAppointmentId,
  disabled = false,
}: AppointmentSlotPickerProps) {
  const [weekStart, setWeekStart] = useState<Dayjs>(() => getWeekStart(initialDate ?? dayjs()));
  const [weekAppointments, setWeekAppointments] = useState<AppointmentResponse[]>([]);
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const professionalId = selectedVet?.id ?? selectedGroomer?.id ?? null;
  const kind = selectedVet ? "veterinarian" : selectedGroomer ? "grooming" : null;

  // Citas de la semana visible (para marcar horarios ocupados)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await AppointmentService.getAllAppointments({
          from: weekStart.format("YYYY-MM-DD"),
          to: weekStart.add(6, "day").format("YYYY-MM-DD"),
        });
        if (!cancelled) setWeekAppointments(data);
      } catch (err) {
        console.error("Error loading week appointments:", err);
        if (!cancelled) setWeekAppointments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  // Horario semanal del profesional seleccionado
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!professionalId || !kind) {
        setSchedules([]);
        return;
      }
      try {
        const data = await SchedulesService.getSchedules(kind, professionalId);
        if (!cancelled) setSchedules(data);
      } catch (err) {
        console.error("Error loading professional schedule:", err);
        if (!cancelled) setSchedules([]);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [professionalId, kind]);

  const scheduleByDay = useMemo(() => {
    const map = new Map<number, ScheduleResponse>();
    schedules.forEach((s) => map.set(s.dayOfWeek, s));
    return map;
  }, [schedules]);

  // Solo las citas del profesional elegido (la cita en edición no cuenta como ocupada)
  const professionalEvents = useMemo(() => {
    if (!professionalId) return [];
    return weekAppointments.filter((a) => {
      if (a.id === excludeAppointmentId) return false;
      return selectedVet
        ? a.veterinarian?.id === selectedVet.id
        : a.groomingStaff?.id === selectedGroomer?.id;
    });
  }, [weekAppointments, professionalId, excludeAppointmentId, selectedVet, selectedGroomer]);

  const toTimeStr = (mins: number): string =>
    `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

  const handleSlotClick = (day: Dayjs, time: string) => {
    if (disabled) return;
    const slotStart = toMinutes(time);

    // Por defecto, un clic selecciona solo una franja corta; si hay profesional
    // con horario ese día, se preselecciona el bloque disponible completo
    // (el usuario puede acortarlo luego con los campos de "ajuste fino").
    let rangeStart = slotStart;
    let rangeEnd = slotStart + SLOT_DURATION;

    if (professionalId) {
      const schedule = scheduleByDay.get(day.day());
      if (!schedule || !schedule.isAvailable) {
        setHint("El profesional no tiene horario disponible ese día. Elige otro día.");
        return;
      }
      const scheduleStart = toMinutes(schedule.startTime);
      const scheduleEnd = toMinutes(schedule.endTime);
      if (slotStart < scheduleStart || slotStart >= scheduleEnd) {
        setHint(
          `Elige una franja dentro del horario de atención (${schedule.startTime.slice(0, 5)}–${schedule.endTime.slice(0, 5)}).`
        );
        return;
      }
      rangeStart = scheduleStart;
      rangeEnd = scheduleEnd;

      const dateStr = day.format("YYYY-MM-DD");
      const busy = professionalEvents.some(
        (a) =>
          a.status !== "cancelada" &&
          a.date === dateStr &&
          rangeStart < toMinutes(a.endTime) &&
          rangeEnd > toMinutes(a.startTime)
      );
      if (busy) {
        setHint(
          "El profesional ya tiene una cita dentro de ese horario. Ajusta el rango con los campos de hora si aún queda una franja libre."
        );
        return;
      }
    }

    setHint(null);
    const start = dayjs(`${day.format("YYYY-MM-DD")}T${toTimeStr(rangeStart)}:00`);
    const end = dayjs(`${day.format("YYYY-MM-DD")}T${toTimeStr(rangeEnd)}:00`);
    onSelect(day, start, end);
  };

  const isPastDay = (day: Dayjs) => day.isBefore(dayjs(), "day");

  const handleDisabledDayClick = (day: Dayjs) => {
    setHint(
      `El ${day.format("dddd D [de] MMMM")} ya pasó. Elige una fecha desde hoy en adelante — te llevamos a la misma franja la próxima semana.`
    );
    setWeekStart(getWeekStart(day.add(7, "day")));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <WeeklyCalendar<AppointmentResponse>
        weekStart={weekStart}
        onWeekChange={setWeekStart}
        events={professionalEvents}
        loading={loading}
        startHour={START_HOUR}
        endHour={END_HOUR}
        maxHeight={360}
        initialScrollHour={8}
        onSlotClick={disabled ? undefined : handleSlotClick}
        isDayDisabled={isPastDay}
        onDisabledDayClick={disabled ? undefined : handleDisabledDayClick}
        renderDayBackground={(day) => {
          if (!professionalId) return null;
          const schedule = scheduleByDay.get(day.day());
          if (!schedule) return null;
          const start = toMinutes(schedule.startTime);
          const end = toMinutes(schedule.endTime);
          return (
            <Box
              sx={(theme) => {
                const color = schedule.isAvailable
                  ? theme.palette.success.main
                  : theme.palette.grey[500];
                return {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${(start / TOTAL_MINUTES) * 100}%`,
                  height: `${((end - start) / TOTAL_MINUTES) * 100}%`,
                  bgcolor: `${color}14`,
                  borderLeft: `3px solid ${color}`,
                  px: 0.5,
                  py: 0.25,
                };
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2,
                }}
              >
                {schedule.isAvailable ? "Horario disponible" : "No disponible"}
              </Typography>
              {schedule.isAvailable && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: "0.65rem",
                    lineHeight: 1.2,
                  }}
                >
                  {schedule.startTime.slice(0, 5)}–{schedule.endTime.slice(0, 5)}
                </Typography>
              )}
            </Box>
          );
        }}
        renderEvent={(a) => {
          const color = getStatusColor(a.status);
          const cancelled = a.status === "cancelada";
          return (
            <Box
              sx={{
                height: "100%",
                borderLeft: `4px solid ${color}`,
                bgcolor: `${color}22`,
                px: 0.5,
                py: 0.25,
                overflow: "hidden",
                opacity: cancelled ? 0.55 : 1,
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
                {a.startTime.slice(0, 5)}–{a.endTime.slice(0, 5)} {a.pet?.name ?? ""}
              </Typography>
            </Box>
          );
        }}
      />

      {hint ? (
        <Alert severity="warning" onClose={() => setHint(null)}>
          {hint}
        </Alert>
      ) : (
        <Typography variant="caption" color="text.secondary">
          {professionalId
            ? "Haz clic en una franja dentro del horario disponible para seleccionar fecha y hora."
            : "Selecciona un profesional para ver su disponibilidad, o haz clic en cualquier franja para elegir fecha y hora."}
        </Typography>
      )}
    </Box>
  );
}
