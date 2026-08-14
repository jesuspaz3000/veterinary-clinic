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

interface ReactivateVaccinationDialogProps {
  open: boolean;
  record: VaccinationRecordResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReactivateVaccinationDialog({
  open,
  record,
  onClose,
  onSuccess,
}: ReactivateVaccinationDialogProps) {
  const [reactivating, setReactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReactivate = async () => {
    setReactivating(true);
    setErrorMessage(null);
    try {
      await VaccinationsService.reactivateVaccinationRecord(record.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error reactivating vaccination record:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al reactivar el registro de vacunación.");
    } finally {
      setReactivating(false);
    }
  };

  return (
    <Dialog open={open} onClose={reactivating ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Reactivar Vacunación</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Typography variant="body1">
          ¿Deseas reactivar el registro de vacunación con <strong>{record.vaccineName}</strong> aplicado a{" "}
          <strong>{record.pet?.name ?? "la mascota"}</strong>? Volverá a aparecer en el listado de registros
          activos.
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
