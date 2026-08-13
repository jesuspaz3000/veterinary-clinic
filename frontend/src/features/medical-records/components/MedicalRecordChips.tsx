"use client";

import { Chip } from "@mui/material";
import {
  RECORD_STATUS_LABELS,
  RECORD_TYPE_LABELS,
  RecordStatus,
  RecordType,
} from "../type/medicalRecordsTypes";

const TYPE_COLORS: Record<RecordType, "info" | "warning" | "success" | "primary" | "error" | "secondary"> = {
  consulta: "info",
  cirugia: "warning",
  vacunacion: "success",
  desparasitacion: "primary",
  emergencia: "error",
  hospitalizacion: "secondary",
};

export function RecordTypeChip({ type }: { type: string }) {
  const known = type as RecordType;
  return (
    <Chip
      label={RECORD_TYPE_LABELS[known] ?? type}
      size="small"
      color={TYPE_COLORS[known] ?? "default"}
      variant="outlined"
      sx={{ fontWeight: 600, borderRadius: "6px" }}
    />
  );
}

export function RecordStatusChip({ status }: { status: string }) {
  const known = status as RecordStatus;
  return (
    <Chip
      label={RECORD_STATUS_LABELS[known] ?? status}
      size="small"
      color={known === "completado" ? "success" : "warning"}
      sx={{ fontWeight: 600, borderRadius: "6px" }}
    />
  );
}
