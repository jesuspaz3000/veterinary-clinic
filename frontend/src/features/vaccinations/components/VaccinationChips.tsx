"use client";

import { Chip } from "@mui/material";
import dayjs from "dayjs";

type DoseStatus = "sin-proxima" | "vencida" | "proxima" | "vigente";

function getDoseStatus(nextDoseDate: string | null): DoseStatus {
  if (!nextDoseDate) return "sin-proxima";
  const today = dayjs().startOf("day");
  const next = dayjs(nextDoseDate).startOf("day");
  if (next.isBefore(today)) return "vencida";
  if (next.diff(today, "day") <= 30) return "proxima";
  return "vigente";
}

const STATUS_CONFIG: Record<
  DoseStatus,
  { label: string; color: "default" | "error" | "warning" | "success" }
> = {
  "sin-proxima": { label: "Sin próxima dosis", color: "default" },
  vencida: { label: "Dosis vencida", color: "error" },
  proxima: { label: "Próxima dosis cercana", color: "warning" },
  vigente: { label: "Al día", color: "success" },
};

export function DoseStatusChip({ nextDoseDate }: { nextDoseDate: string | null }) {
  const config = STATUS_CONFIG[getDoseStatus(nextDoseDate)];
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
