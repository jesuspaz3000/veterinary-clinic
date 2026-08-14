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
import { UsersService } from "../service/users.service";
import { UserResponse } from "../type/usersTypes";

interface ReactivateUserProps {
  open: boolean;
  user: UserResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReactivateUser({ open, user, onClose, onSuccess }: ReactivateUserProps) {
  const [reactivating, setReactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReactivate = async () => {
    if (!user) return;

    setReactivating(true);
    setErrorMessage(null);

    try {
      await UsersService.reactivateUser(user.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error reactivating user:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg = err.response?.data?.message || err.message || "Error inesperado al intentar reactivar el usuario.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setReactivating(false);
    }
  };

  return (
    <Dialog open={open} onClose={reactivating ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Reactivar Usuario</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          ¿Deseas reactivar al usuario <strong>{user?.username}</strong>? Volverá a tener acceso al
          sistema y aparecerá en el listado de usuarios activos.
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
