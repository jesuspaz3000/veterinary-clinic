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
import { UsersService } from "../service/users.service";
import { UserResponse } from "../type/usersTypes";

interface DeleteUserProps {
  open: boolean;
  user: UserResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteUser({ open, user, onClose, onSuccess }: DeleteUserProps) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;

    setDeleting(true);
    setErrorMessage(null);

    try {
      await UsersService.deleteUser(user.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg = err.response?.data?.message || err.message || "Error inesperado al intentar eliminar el usuario.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={deleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar Usuario?</DialogTitle>
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
          ¿Estás seguro de que deseas eliminar el usuario <strong>{user?.username}</strong>? 
          Esta acción no se puede deshacer y el usuario perderá acceso al sistema.
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
