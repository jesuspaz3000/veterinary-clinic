"use client";

import { Chip } from "@mui/material";
import {
  HOSPITALIZATION_STATUS_LABELS,
  HospitalizationStatus,
} from "../type/hospitalizationsTypes";

const STATUS_COLORS: Record<HospitalizationStatus, "warning" | "success" | "info"> = {
  activo: "warning",
  alta: "success",
  transferido: "info",
};

export function HospitalizationStatusChip({ status }: { status: string }) {
  const known = status as HospitalizationStatus;
  return (
    <Chip
      label={HOSPITALIZATION_STATUS_LABELS[known] ?? status}
      size="small"
      color={STATUS_COLORS[known] ?? "default"}
      sx={{ fontWeight: 600, borderRadius: "6px" }}
    />
  );
}
