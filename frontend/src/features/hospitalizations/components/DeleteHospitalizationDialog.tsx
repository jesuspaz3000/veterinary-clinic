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
import { HospitalizationsService } from "../service/hospitalizations.service";
import { HospitalizationRecordResponse } from "../type/hospitalizationsTypes";

interface DeleteHospitalizationDialogProps {
  open: boolean;
  record: HospitalizationRecordResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteHospitalizationDialog({
  open,
  record,
  onClose,
  onSuccess,
}: DeleteHospitalizationDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMessage(null);
    try {
      await HospitalizationsService.deleteHospitalization(record.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error deleting hospitalization record:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al eliminar el registro de hospitalización.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={deleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Eliminar Hospitalización</DialogTitle>
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
          ¿Estás seguro de que deseas eliminar el registro de hospitalización de{" "}
          <strong>{record.pet?.name ?? "la mascota"}</strong>?
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Esta acción eliminará el registro junto con todas sus evoluciones. No se puede deshacer.
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
