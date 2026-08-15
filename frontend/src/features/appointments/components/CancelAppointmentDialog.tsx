"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { AppointmentService } from "../service/appointments.service";
import { AppointmentResponse } from "../type/appointmentsTypes";

interface CancelAppointmentDialogProps {
  open: boolean;
  appointment: AppointmentResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancelAppointmentDialog({
  open,
  appointment,
  onClose,
  onSuccess,
}: CancelAppointmentDialogProps) {
  const [cancelling, setCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCancel = async () => {
    setCancelling(true);
    setErrorMessage(null);
    try {
      await AppointmentService.cancelAppointment(appointment.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error cancelling appointment:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        err.response?.data?.message || err.message || "Error al cancelar la cita."
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Dialog open={open} onClose={cancelling ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Cancelar Cita</DialogTitle>
      <IconButton
        aria-label="Cerrar"
        onClick={onClose}
        disabled={cancelling}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "text.secondary",
        }}
      >
        <CloseRoundedIcon />
      </IconButton>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Typography variant="body1">
          ¿Estás seguro de que deseas cancelar la cita de <strong>{appointment.pet.name}</strong>{" "}
          ({appointment.serviceType}) del {appointment.date} a las {appointment.startTime.slice(0, 5)}?
        </Typography>
        <Typography variant="caption" color="text.secondary">
          La cita no se elimina: quedará registrada con estado &quot;cancelada&quot; y liberará el
          horario del veterinario.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={cancelling} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Volver
        </Button>
        <Button
          onClick={() => void handleCancel()}
          disabled={cancelling}
          variant="contained"
          color="error"
          sx={{ borderRadius: "8px", textTransform: "none", minWidth: 110 }}
        >
          {cancelling ? <CircularProgress size={20} color="inherit" /> : "Cancelar Cita"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
