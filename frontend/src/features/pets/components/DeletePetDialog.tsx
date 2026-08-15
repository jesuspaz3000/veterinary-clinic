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
import { PetService } from "../service/pets.service";
import { PetResponse } from "../type/petsTypes";

interface DeletePetDialogProps {
  open: boolean;
  pet: PetResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeletePetDialog({ open, pet, onClose, onSuccess }: DeletePetDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMessage(null);
    try {
      await PetService.deletePet(pet.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error deleting pet:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al desactivar el perfil de la mascota.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={deleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Desactivar Mascota</DialogTitle>
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
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Typography variant="body1">
          ¿Estás seguro de que deseas desactivar la mascota <strong>{pet.name}</strong> ({pet.species})?
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Esta acción ocultará a la mascota del sistema manteniendo su historial médico registrado.
        </Typography>
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
          sx={{ borderRadius: "8px", textTransform: "none", minWidth: 110 }}
        >
          {deleting ? <CircularProgress size={20} color="inherit" /> : "Desactivar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
