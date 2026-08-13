"use client";

import { Chip } from "@mui/material";
import {
  SURGERY_STATUS_LABELS,
  SURGERY_TYPE_LABELS,
  SurgeryStatus,
  SurgeryType,
} from "../type/surgeriesTypes";

const TYPE_COLORS: Record<SurgeryType, "info" | "warning" | "error"> = {
  esterilizacion: "info",
  trauma: "error",
  tumor: "warning",
};

export function SurgeryTypeChip({ type }: { type: string }) {
  const known = type as SurgeryType;
  return (
    <Chip
      label={SURGERY_TYPE_LABELS[known] ?? type}
      size="small"
      color={TYPE_COLORS[known] ?? "default"}
      variant="outlined"
      sx={{ fontWeight: 600, borderRadius: "6px" }}
    />
  );
}

const STATUS_COLORS: Record<SurgeryStatus, "default" | "info" | "success" | "error"> = {
  programada: "info",
  en_proceso: "default",
  completada: "success",
  cancelada: "error",
};

export function SurgeryStatusChip({ status }: { status: string }) {
  const known = status as SurgeryStatus;
  return (
    <Chip
      label={SURGERY_STATUS_LABELS[known] ?? status}
      size="small"
      color={STATUS_COLORS[known] ?? "default"}
      sx={{ fontWeight: 600, borderRadius: "6px" }}
    />
  );
}
