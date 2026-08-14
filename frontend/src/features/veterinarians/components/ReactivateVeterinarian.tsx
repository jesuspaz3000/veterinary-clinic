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
import { VeterinariansService } from "../service/veterinarians.service";
import { VeterinarianResponse } from "../type/veterinariansTypes";

interface ReactivateVeterinarianProps {
  open: boolean;
  veterinarian: VeterinarianResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReactivateVeterinarian({
  open,
  veterinarian,
  onClose,
  onSuccess,
}: ReactivateVeterinarianProps) {
  const [reactivating, setReactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReactivate = async () => {
    if (!veterinarian) return;

    setReactivating(true);
    setErrorMessage(null);

    try {
      await VeterinariansService.reactivateVeterinarian(veterinarian.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error reactivating veterinarian:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg =
        err.response?.data?.message || err.message || "Error inesperado al reactivar el veterinario.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setReactivating(false);
    }
  };

  const displayName = veterinarian?.user
    ? `${veterinarian.user.firstName || ""} ${veterinarian.user.lastName || ""}`.trim() || veterinarian.user.username
    : "este veterinario";

  return (
    <Dialog open={open} onClose={reactivating ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>¿Reactivar Veterinario?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          ¿Deseas reactivar a <strong>{displayName}</strong> (Lic. {veterinarian?.licenseNumber})? Volverá a
          estar activo y su usuario podrá iniciar sesión nuevamente.
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
