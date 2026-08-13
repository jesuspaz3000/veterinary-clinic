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
import { VaccinationsService } from "../service/vaccinations.service";
import { VaccinationRecordResponse } from "../type/vaccinationsTypes";

interface DeleteVaccinationDialogProps {
  open: boolean;
  record: VaccinationRecordResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteVaccinationDialog({
  open,
  record,
  onClose,
  onSuccess,
}: DeleteVaccinationDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMessage(null);
    try {
      await VaccinationsService.deleteVaccinationRecord(record.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error deleting vaccination record:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al eliminar el registro de vacunación.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={deleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Eliminar Vacunación</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Typography variant="body1">
          ¿Estás seguro de que deseas eliminar el registro de vacunación con{" "}
          <strong>{record.vaccineName}</strong> aplicado a{" "}
          <strong>{record.pet?.name ?? "la mascota"}</strong>?
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Esta acción no se puede deshacer.
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
          {deleting ? <CircularProgress size={20} color="inherit" /> : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
