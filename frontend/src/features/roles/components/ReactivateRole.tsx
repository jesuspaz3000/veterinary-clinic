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
} from "@mui/material";
import { RolesService } from "../services/roles.service";
import { Role } from "../types/rolesTypes";

interface ReactivateRoleProps {
  open: boolean;
  role: Role | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReactivateRole({ open, role, onClose, onSuccess }: ReactivateRoleProps) {
  const [reactivating, setReactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReactivate = async () => {
    if (!role) return;

    setReactivating(true);
    setErrorMessage(null);

    try {
      await RolesService.reactivateRole(role.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error reactivating role:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg = err.response?.data?.message || err.message || "Error inesperado al intentar reactivar el rol.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setReactivating(false);
    }
  };

  return (
    <Dialog open={open} onClose={reactivating ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>¿Reactivar Rol?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          ¿Estás seguro de que deseas reactivar el rol <strong>{role?.name}</strong>?
          Volverá a estar disponible para asignarse a usuarios.
        </DialogContentText>

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={reactivating} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          onClick={() => void handleReactivate()}
          disabled={reactivating}
          variant="contained"
          color="success"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            minWidth: 110,
          }}
        >
          {reactivating ? <CircularProgress size={20} color="inherit" /> : "Reactivar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
