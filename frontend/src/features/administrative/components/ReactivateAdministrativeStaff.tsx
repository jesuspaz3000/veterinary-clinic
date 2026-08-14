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
} from "@mui/material";
import { AdministrativeService } from "../service/administrative.service";
import { AdministrativeStaffResponse } from "../type/administrativeTypes";

interface ReactivateAdministrativeStaffProps {
  open: boolean;
  staff: AdministrativeStaffResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReactivateAdministrativeStaff({ open, staff, onClose, onSuccess }: ReactivateAdministrativeStaffProps) {
  const [reactivating, setReactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReactivate = async () => {
    setReactivating(true);
    setErrorMessage(null);

    try {
      await AdministrativeService.reactivateAdministrativeStaff(staff.id);
      onSuccess();
      onClose();
    } catch (error) {
      setErrorMessage("Error al reactivar el personal administrativo. Por favor, intente nuevamente.");
      console.error(error);
    } finally {
      setReactivating(false);
    }
  };

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  const fullName = `${staff.user.firstName || ""} ${staff.user.lastName || ""}`.trim() || staff.user.username;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Reactivar Personal Administrativo
        </Typography>
      </DialogTitle>
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <Typography variant="body1">
          ¿Deseas reactivar a <strong>{fullName}</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Volverá a aparecer en el listado de personal activo y podrá iniciar sesión nuevamente.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={reactivating} sx={{ borderRadius: "8px" }}>
          Cancelar
        </Button>
        <Button
          onClick={() => void handleReactivate()}
          variant="contained"
          color="success"
          disabled={reactivating}
          sx={{ borderRadius: "8px", px: 3 }}
        >
          {reactivating ? <CircularProgress size={20} color="inherit" /> : "Reactivar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
