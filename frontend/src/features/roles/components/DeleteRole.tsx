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
import { RolesService } from "../services/roles.service";
import { Role } from "../types/rolesTypes";

interface DeleteRoleProps {
  open: boolean;
  role: Role | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteRole({ open, role, onClose, onSuccess }: DeleteRoleProps) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!role) return;

    setDeleting(true);
    setErrorMessage(null);

    try {
      await RolesService.deleteRole(role.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error deleting role:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg = err.response?.data?.message || err.message || "Error inesperado al intentar eliminar el rol.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={deleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar Rol?</DialogTitle>
      <IconButton
        aria-label="Cerrar"
        onClick={onClose}
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
        <DialogContentText sx={{ mb: 2 }}>
          ¿Estás seguro de que deseas eliminar el rol <strong>{role?.name}</strong>? 
          Esta acción no se puede deshacer y el rol ya no estará disponible para asignarse a usuarios.
        </DialogContentText>
        
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={deleting} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          onClick={() => void handleDelete()}
          disabled={deleting}
          variant="contained"
          color="error"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            minWidth: 100,
          }}
        >
          {deleting ? <CircularProgress size={20} color="inherit" /> : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
