"use client";

import React, { useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Box, Typography, Paper, Skeleton, IconButton, Tooltip, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";

export interface CalendarEvent {
  id: string;
  /** Fecha del evento en formato YYYY-MM-DD */
  date: string;
  /** Hora de inicio en formato HH:mm */
  startTime: string;
  /** Hora de fin en formato HH:mm */
  endTime: string;
}

interface WeeklyCalendarProps<T extends CalendarEvent> {
  /** Lunes de la semana a mostrar */
  weekStart: Dayjs;
  /** Cambio de semana (no se utiliza en modo recurrente) */
  onWeekChange?: (newWeekStart: Dayjs) => void;
  events: T[];
  /** true solo en la carga inicial: muestra skeletons */
  loading?: boolean;
  /** true en recargas con la grilla ya montada (cambio de semana): atenúa la grilla sin pestañear */
  refreshing?: boolean;
  /** Primera hora visible (por defecto 8) */
  startHour?: number;
  /** Última hora visible, exclusiva (por defecto 20) */
  endHour?: number;
  /** Duración de cada franja clickeable en minutos (por defecto 60) */
  slotMinutes?: number;
  /** true = patrón semanal recurrente: oculta la navegación y los números de fecha */
  recurring?: boolean;
  /** Altura máxima de la grilla con scroll vertical interno (útil para rangos de 24 h) */
  maxHeight?: number;
  /** Hora a la que se posiciona el scroll al montar la grilla */
  initialScrollHour?: number;
  /** Fondo decorativo por columna de día (ej. horario de atención); no intercepta clics */
  renderDayBackground?: (day: Dayjs) => React.ReactNode;
  renderEvent: (event: T) => React.ReactNode;
  onEventClick?: (event: T) => void;
  onSlotClick?: (date: Dayjs, time: string) => void;
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DAY_LABELS_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const SLOT_HEIGHT = 56;
const TIME_COL_WIDTH = 64;

/** Calcula el lunes de la semana de una fecha dada */
export function getWeekStart(date: Dayjs): Dayjs {
  return date.subtract((date.day() + 6) % 7, "day").startOf("day");
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export default function WeeklyCalendar<T extends CalendarEvent>({
  weekStart,
  onWeekChange,
  events,
  loading = false,
  refreshing = false,
  startHour = 8,
  endHour = 20,
  slotMinutes = 60,
  recurring = false,
  maxHeight,
  initialScrollHour,
  renderDayBackground,
  renderEvent,
  onEventClick,
  onSlotClick,
}: WeeklyCalendarProps<T>) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  // Posiciona el scroll en la hora indicada una vez montada la grilla
  useEffect(() => {
    if (gridScrollRef.current && initialScrollHour !== undefined) {
      gridScrollRef.current.scrollTop = Math.max(
        0,
        (initialScrollHour - startHour) * SLOT_HEIGHT
      );
    }
  }, [initialScrollHour, startHour, loading]);
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const totalMinutes = (endHour - startHour) * 60;
  const slotHeight = (slotMinutes / 60) * SLOT_HEIGHT;
  // Franjas clickeables por día (ej. 12 franjas de 60 min entre 08:00 y 20:00)
  const slots = Array.from(
    { length: totalMinutes / slotMinutes },
    (_, i) => startHour * 60 + i * slotMinutes
  );
  const gridHeight = (totalMinutes / 60) * SLOT_HEIGHT;
  const today = dayjs();

  const eventsByDate = (date: Dayjs) =>
    events.filter((e) => e.date === date.format("YYYY-MM-DD"));

  const weekEnd = weekStart.add(6, "day");
  const rangeLabel =
    weekStart.month() === weekEnd.month()
      ? `${weekStart.date()} – ${weekEnd.date()} ${weekEnd.format("MMMM YYYY")}`
      : `${weekStart.format("D MMM")} – ${weekEnd.format("D MMM YYYY")}`;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid",
        borderColor: (theme) =>
          theme.palette.mode === "light" ? "rgba(26, 153, 153, 0.2)" : "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
        boxShadow: (theme) =>
          theme.palette.mode === "light"
            ? "0 4px 20px rgba(13, 31, 45, 0.08), 0 1px 3px rgba(13, 31, 45, 0.04)"
            : "0 4px 30px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Toolbar: navegación de semana (título estático en modo recurrente) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.tableHeader",
        }}
      >
        {recurring ? (
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, px: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
              Semana recurrente
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              El mismo horario se repite cada semana
            </Typography>
          </Box>
        ) : (
          <>
            {/* El rango de la semana funciona como botón: abre el calendario grande para saltar a cualquier fecha */}
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Button
                onClick={() => setPickerOpen(true)}
                startIcon={<CalendarMonthRoundedIcon fontSize="small" />}
                sx={{
                  textTransform: "capitalize",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "text.primary",
                  px: 1,
                }}
              >
                {rangeLabel}
              </Button>
              {/* Campo del DatePicker oculto: solo sirve como ancla del popup.
                  pointerEvents none para que no intercepte los clics del botón. */}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <DatePicker
                  open={pickerOpen}
                  onClose={() => setPickerOpen(false)}
                  value={weekStart}
                  onChange={(newValue) => {
                    if (newValue && newValue.isValid()) onWeekChange?.(getWeekStart(newValue));
                    setPickerOpen(false);
                  }}
                  slotProps={{
                    textField: {
                      slotProps: { htmlInput: { tabIndex: -1, "aria-hidden": true } },
                      sx: { width: 1, height: 1, opacity: 0, pointerEvents: "none" },
                    },
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Semana anterior">
                <IconButton size="small" onClick={() => onWeekChange?.(weekStart.subtract(7, "day"))}>
                  <ChevronLeftRoundedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ir a hoy">
                <IconButton size="small" onClick={() => onWeekChange?.(getWeekStart(today))}>
                  <TodayRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Semana siguiente">
                <IconButton size="small" onClick={() => onWeekChange?.(weekStart.add(7, "day"))}>
                  <ChevronRightRoundedIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        )}
      </Box>

      {loading ? (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from(new Array(6)).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={SLOT_HEIGHT} />
          ))}
        </Box>
      ) : (
        <Box
          ref={gridScrollRef}
          sx={{
            overflowX: "auto",
            overflowY: maxHeight ? "auto" : undefined,
            maxHeight: maxHeight ?? undefined,
            opacity: refreshing ? 0.5 : 1,
            transition: "opacity 0.2s ease",
            pointerEvents: refreshing ? "none" : undefined,
            // Scrollbar fina y tematizada, coherente con los pickers de hora
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(42, 191, 191, 0.45) transparent",
            "&::-webkit-scrollbar": { width: 6, height: 6 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(42, 191, 191, 0.45)",
              borderRadius: "3px",
            },
          }}
        >
          <Box sx={{ minWidth: 840 }}>
            {/* Encabezados de día: fijos durante el scroll vertical de la grilla */}
            <Box
              sx={{
                display: "flex",
                borderBottom: "2px solid",
                borderColor: "divider",
                position: "sticky",
                top: 0,
                zIndex: 3,
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ width: TIME_COL_WIDTH, flexShrink: 0 }} />
              {days.map((day, i) => {
                const isToday = !recurring && day.isSame(today, "day");
                return (
                  <Box
                    key={day.format("YYYY-MM-DD")}
                    sx={{
                      flex: 1,
                      textAlign: "center",
                      py: 1.25,
                      borderLeft: "1px solid",
                      borderColor: "divider",
                      bgcolor: isToday ? "action.selected" : "transparent",
                    }}
                  >
                    {/* Día y fecha en una sola línea (horizontal) */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "center",
                        gap: 0.75,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: isToday ? "primary.main" : "text.secondary",
                        }}
                      >
                        {recurring ? DAY_LABELS_FULL[i] : DAY_LABELS[i]}
                      </Typography>
                      {!recurring && (
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: isToday ? 800 : 600,
                            color: isToday ? "primary.main" : "text.primary",
                          }}
                        >
                          {day.date()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Grilla horaria */}
            <Box sx={{ display: "flex" }}>
              {/* Columna de horas */}
              <Box sx={{ width: TIME_COL_WIDTH, flexShrink: 0, height: gridHeight }}>
                {hours.map((hour) => (
                  <Box
                    key={hour}
                    sx={{
                      height: SLOT_HEIGHT,
                      pr: 1,
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        // La primera etiqueta no se sube para no chocar con el borde del encabezado
                        transform: hour === startHour ? "translateY(4px)" : "translateY(-7px)",
                      }}
                    >
                      {formatHour(hour)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Columnas de día con eventos posicionados */}
              {days.map((day) => (
                <Box
                  key={day.format("YYYY-MM-DD")}
                  sx={{
                    flex: 1,
                    position: "relative",
                    height: gridHeight,
                    borderLeft: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {/* Fondo del día (horarios de atención, etc.) */}
                  {renderDayBackground && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1,
                        pointerEvents: "none",
                        overflow: "hidden",
                      }}
                    >
                      {renderDayBackground(day)}
                    </Box>
                  )}

                  {/* Franjas clickeables */}
                  {slots.map((slotStart) => (
                    <Box
                      key={slotStart}
                      onClick={() => {
                        const h = String(Math.floor(slotStart / 60)).padStart(2, "0");
                        const m = String(slotStart % 60).padStart(2, "0");
                        onSlotClick?.(day, `${h}:${m}`);
                      }}
                      sx={{
                        height: slotHeight,
                        borderBottom: (slotStart + slotMinutes) % 60 === 0 ? "1px solid" : "1px dashed",
                        borderColor: "divider",
                        cursor: onSlotClick ? "pointer" : "default",
                        transition: "background-color 0.15s ease",
                        "&:hover": onSlotClick ? { bgcolor: "action.hover" } : {},
                      }}
                    />
                  ))}

                  {/* Eventos */}
                  {eventsByDate(day).map((event) => {
                    const start = Math.max(toMinutes(event.startTime), startHour * 60);
                    const end = Math.min(toMinutes(event.endTime), endHour * 60);
                    if (end <= start) return null;
                    const top = ((start - startHour * 60) / totalMinutes) * gridHeight;
                    const height = Math.max(((end - start) / totalMinutes) * gridHeight - 2, 22);
                    return (
                      <Box
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        sx={{
                          position: "absolute",
                          top,
                          height,
                          left: 3,
                          right: 3,
                          zIndex: 2,
                          cursor: onEventClick ? "pointer" : "default",
                          overflow: "hidden",
                        }}
                      >
                        {renderEvent(event)}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
