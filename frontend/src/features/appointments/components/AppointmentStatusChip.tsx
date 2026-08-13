"use client";

import { Chip } from "@mui/material";
import {
  AppointmentStatus,
  APPOINTMENT_STATUS_LABELS,
} from "../type/appointmentsTypes";

const STATUS_CHIP_COLOR: Record<
  AppointmentStatus,
  "warning" | "info" | "success" | "error"
> = {
  pendiente: "warning",
  confirmada: "info",
  completada: "success",
  cancelada: "error",
};

export function getStatusColor(status: AppointmentStatus): string {
  switch (status) {
    case "pendiente":
      return "#E6A23C";
    case "confirmada":
      return "#409EFF";
    case "completada":
      return "#2E7D32";
    case "cancelada":
      return "#D64550";
  }
}

export default function AppointmentStatusChip({ status }: { status: AppointmentStatus }) {
  return (
    <Chip
      label={APPOINTMENT_STATUS_LABELS[status] || status}
      size="small"
      color={STATUS_CHIP_COLOR[status] || "default"}
      variant={status === "cancelada" ? "outlined" : "filled"}
      sx={{ fontWeight: 600, borderRadius: "6px" }}
    />
  );
}
