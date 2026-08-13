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
import { MedicalRecordsService } from "../service/medicalRecords.service";
import { MedicalRecordResponse, RECORD_TYPE_LABELS } from "../type/medicalRecordsTypes";

interface DeleteMedicalRecordDialogProps {
  open: boolean;
  record: MedicalRecordResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteMedicalRecordDialog({
  open,
  record,
  onClose,
  onSuccess,
}: DeleteMedicalRecordDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMessage(null);
    try {
      await MedicalRecordsService.deleteMedicalRecord(record.id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error deleting medical record:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al eliminar el registro médico.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={deleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Eliminar Registro Médico</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Typography variant="body1">
          ¿Estás seguro de que deseas eliminar el registro de{" "}
          <strong>{RECORD_TYPE_LABELS[record.recordType] ?? record.recordType}</strong> de{" "}
          <strong>{record.pet?.name ?? "la mascota"}</strong>?
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Esta acción eliminará el registro junto con sus prescripciones y documentos adjuntos. No se puede deshacer.
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
