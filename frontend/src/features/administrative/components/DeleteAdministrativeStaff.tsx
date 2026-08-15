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
import { AdministrativeService } from "../service/administrative.service";
import { AdministrativeStaffResponse } from "../type/administrativeTypes";

interface DeleteAdministrativeStaffProps {
  open: boolean;
  staff: AdministrativeStaffResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteAdministrativeStaff({ open, staff, onClose, onSuccess }: DeleteAdministrativeStaffProps) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMessage(null);

    try {
      await AdministrativeService.deleteAdministrativeStaff(staff.id);
      onSuccess();
      onClose();
    } catch (error) {
      setErrorMessage("Error al eliminar el personal administrativo. Por favor, intente nuevamente.");
      console.error(error);
    } finally {
      setDeleting(false);
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
          Eliminar Personal Administrativo
        </Typography>
      </DialogTitle>
      <IconButton
        aria-label="Cerrar"
        onClick={handleClose}
        disabled={deleting}
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
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <Typography variant="body1">
          ¿Estás seguro de que deseas eliminar a <strong>{fullName}</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Esta acción eliminará el personal administrativo y desactivará el usuario asociado.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={deleting} sx={{ borderRadius: "8px" }}>
          Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={deleting}
          sx={{ borderRadius: "8px", px: 3 }}
        >
          {deleting ? <CircularProgress size={20} color="inherit" /> : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
