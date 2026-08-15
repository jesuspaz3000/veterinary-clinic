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
import { VeterinariansService } from "../service/veterinarians.service";
import { VeterinarianResponse } from "../type/veterinariansTypes";

interface DeleteVeterinarianProps {
  open: boolean;
  veterinarian: VeterinarianResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteVeterinarian({
  open,
  veterinarian,
  onClose,
  onSuccess,
}: DeleteVeterinarianProps) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!veterinarian) return;

    setDeleting(true);
    setErrorMessage(null);

    try {
      await VeterinariansService.deleteVeterinarian(veterinarian.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error deactivating veterinarian:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg =
        err.response?.data?.message || err.message || "Error inesperado al cambiar el estado del veterinario.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const displayName = veterinarian?.user
    ? `${veterinarian.user.firstName || ""} ${veterinarian.user.lastName || ""}`.trim() || veterinarian.user.username
    : "este veterinario";

  return (
    <Dialog open={open} onClose={deleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>¿Desactivar Veterinario?</DialogTitle>
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
          ¿Estás seguro de que deseas desactivar a <strong>{displayName}</strong> (Lic. {veterinarian?.licenseNumber})?
          El estado del veterinario y de su usuario pasará a ser inactivo.
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
          {deleting ? <CircularProgress size={20} color="inherit" /> : "Desactivar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
