"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  Paper,
} from "@mui/material";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import VaccinesRoundedIcon from "@mui/icons-material/VaccinesRounded";
import PestControlRoundedIcon from "@mui/icons-material/PestControlRounded";
import HealingRoundedIcon from "@mui/icons-material/HealingRounded";
import HotelRoundedIcon from "@mui/icons-material/HotelRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { PetService } from "../service/pets.service";
import { ClinicalHistoryEntry, ClinicalHistoryEntryType, PetResponse } from "../type/petsTypes";

interface ClinicalHistoryDialogProps {
  open: boolean;
  pet: PetResponse;
  onClose: () => void;
}

const TYPE_META: Record<
  ClinicalHistoryEntryType,
  { label: string; color: "primary" | "info" | "success" | "warning" | "error" | "secondary"; icon: React.ReactNode }
> = {
  appointment: { label: "Cita", color: "info", icon: <EventAvailableRoundedIcon fontSize="small" /> },
  medical_record: { label: "Registro médico", color: "primary", icon: <AssignmentRoundedIcon fontSize="small" /> },
  vaccination: { label: "Vacunación", color: "success", icon: <VaccinesRoundedIcon fontSize="small" /> },
  deworming: { label: "Desparasitación", color: "warning", icon: <PestControlRoundedIcon fontSize="small" /> },
  surgery: { label: "Cirugía", color: "error", icon: <HealingRoundedIcon fontSize="small" /> },
  hospitalization: { label: "Hospitalización", color: "secondary", icon: <HotelRoundedIcon fontSize="small" /> },
};

export default function ClinicalHistoryDialog({ open, pet, onClose }: ClinicalHistoryDialogProps) {
  const [entries, setEntries] = useState<ClinicalHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await PetService.getClinicalHistory(pet.id);
        if (!cancelled) setEntries(data);
      } catch (error: unknown) {
        console.error("Error loading clinical history:", error);
        if (!cancelled) {
          const err = error as { response?: { data?: { message?: string } }; message?: string };
          setErrorMessage(
            err.response?.data?.message || err.message || "Error al cargar el historial clínico."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, pet.id]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <HistoryRoundedIcon color="primary" /> Historial Clínico — {pet.name}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            Esta mascota todavía no tiene citas, registros médicos, vacunaciones, desparasitaciones,
            cirugías ni hospitalizaciones registradas.
          </Typography>
        ) : (
          entries.map((entry) => {
            const meta = TYPE_META[entry.type];
            return (
              <Paper
                key={`${entry.type}-${entry.id}`}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: "10px",
                  borderLeft: "4px solid",
                  borderLeftColor: `${meta.color}.main`,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ color: `${meta.color}.main`, display: "flex" }}>{meta.icon}</Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {entry.title}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                    {dayjs(entry.date).format("DD/MM/YYYY HH:mm")}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                  <Chip label={meta.label} size="small" color={meta.color} variant="outlined" sx={{ fontWeight: 600 }} />
                  {entry.status && (
                    <Chip label={entry.status} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  )}
                  {entry.subtitle && (
                    <Typography variant="caption" color="text.secondary">
                      {entry.subtitle}
                    </Typography>
                  )}
                </Box>

                {entry.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {entry.description}
                  </Typography>
                )}
              </Paper>
            );
          })
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
