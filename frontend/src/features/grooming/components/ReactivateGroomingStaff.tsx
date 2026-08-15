"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { GroomingService } from "../service/grooming.service";
import { GroomingStaffResponse } from "../type/groomingTypes";

interface ReactivateGroomingStaffProps {
  open: boolean;
  staff: GroomingStaffResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReactivateGroomingStaff({
  open,
  staff,
  onClose,
  onSuccess,
}: ReactivateGroomingStaffProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReactivate = async () => {
    if (!staff) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      await GroomingService.reactivateGroomingStaff(staff.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error reactivating grooming staff member:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al reactivar el personal.");
    } finally {
      setLoading(false);
    }
  };

  const displayName = staff?.user
    ? `${staff.user.firstName || ""} ${staff.user.lastName || ""}`.trim() || staff.user.username
    : "este personal";

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Reactivar Personal</DialogTitle>
      <IconButton
        aria-label="Cerrar"
        onClick={onClose}
        disabled={loading}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "text.secondary",
        }}
      >
        <CloseRoundedIcon />
      </IconButton>
      <DialogContent>
        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
        <DialogContentText>
          ¿Deseas reactivar a <strong>{displayName}</strong>? Volverá a aparecer en el listado de personal
          activo y podrá iniciar sesión nuevamente.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          onClick={() => void handleReactivate()}
          disabled={loading}
          variant="contained"
          color="success"
          sx={{ borderRadius: "8px", textTransform: "none", minWidth: 110 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Reactivar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
