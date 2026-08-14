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
import { PetService } from "../service/pets.service";
import { PetResponse } from "../type/petsTypes";

interface ReactivatePetDialogProps {
  open: boolean;
  pet: PetResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReactivatePetDialog({ open, pet, onClose, onSuccess }: ReactivatePetDialogProps) {
  const [reactivating, setReactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReactivate = async () => {
    setReactivating(true);
    setErrorMessage(null);
    try {
      await PetService.reactivatePet(pet.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error reactivating pet:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al reactivar el perfil de la mascota.");
    } finally {
      setReactivating(false);
    }
  };

  return (
    <Dialog open={open} onClose={reactivating ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Reactivar Mascota</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Typography variant="body1">
          ¿Deseas reactivar a <strong>{pet.name}</strong> ({pet.species})? Volverá a aparecer en el
          listado de mascotas activas.
        </Typography>
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
          sx={{ borderRadius: "8px", textTransform: "none", minWidth: 110 }}
        >
          {reactivating ? <CircularProgress size={20} color="inherit" /> : "Reactivar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
