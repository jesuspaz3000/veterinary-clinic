"use client";

import { Chip } from "@mui/material";
import dayjs from "dayjs";
import { DEWORMING_TYPE_LABELS, DewormingType } from "../type/dewormingTypes";

const TYPE_COLORS: Record<DewormingType, "info" | "warning" | "primary"> = {
  interna: "info",
  externa: "warning",
  ambas: "primary",
};

export function DewormingTypeChip({ type }: { type: string }) {
  const known = type as DewormingType;
  return (
    <Chip
      label={DEWORMING_TYPE_LABELS[known] ?? type}
      size="small"
      color={TYPE_COLORS[known] ?? "default"}
      variant="outlined"
      sx={{ fontWeight: 600, borderRadius: "6px" }}
    />
  );
}

type DoseStatus = "sin-proxima" | "vencida" | "proxima" | "vigente";

function getDoseStatus(nextApplicationDate: string | null): DoseStatus {
  if (!nextApplicationDate) return "sin-proxima";
  const today = dayjs().startOf("day");
  const next = dayjs(nextApplicationDate).startOf("day");
  if (next.isBefore(today)) return "vencida";
  if (next.diff(today, "day") <= 30) return "proxima";
  return "vigente";
}

const STATUS_CONFIG: Record<
  DoseStatus,
  { label: string; color: "default" | "error" | "warning" | "success" }
> = {
  "sin-proxima": { label: "Sin próxima aplicación", color: "default" },
  vencida: { label: "Aplicación vencida", color: "error" },
  proxima: { label: "Próxima aplicación cercana", color: "warning" },
  vigente: { label: "Al día", color: "success" },
};

export function DewormingDoseStatusChip({ nextApplicationDate }: { nextApplicationDate: string | null }) {
  const config = STATUS_CONFIG[getDoseStatus(nextApplicationDate)];
  return (
    <Chip
      label={config.label}
      size="small"
      color={config.color}
      variant="outlined"
      sx={{ fontWeight: 600, borderRadius: "6px" }}
    />
  );
}
