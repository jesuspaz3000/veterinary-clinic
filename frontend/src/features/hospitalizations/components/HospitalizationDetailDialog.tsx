"use client";

import { useCallback, useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { HospitalizationsService } from "../service/hospitalizations.service";
import {
  HospitalizationRecordResponse,
  HospitalizationEvolutionRequest,
  INTAKE_OPTIONS,
  INTAKE_LABELS,
  URINATION_OPTIONS,
  URINATION_LABELS,
  DEFECATION_OPTIONS,
  DEFECATION_LABELS,
  ACTIVITY_LEVEL_OPTIONS,
  ACTIVITY_LEVEL_LABELS,
} from "../type/hospitalizationsTypes";
import { HospitalizationStatusChip } from "./HospitalizationChips";
import { getUserDisplayName } from "@/features/appointments/utils/professionals";
import { VeterinariansService } from "@/features/veterinarians/service/veterinarians.service";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";
import NumberInput from "@/shared/components/NumberInput";
import { useAuthStore } from "@/store/auth.store";
import { PERMISSIONS } from "@/shared/config/permissions";

interface HospitalizationDetailDialogProps {
  open: boolean;
  recordId: string;
  onClose: () => void;
  onChanged: () => void;
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-wrap" }}>
        {value}
      </Typography>
    </Box>
  );
}

const emptyEvolutionForm = () => ({
  evolutionDate: dayjs() as Dayjs | null,
  veterinarian: null as VeterinarianResponse | null,
  weight: "",
  temperature: "",
  heartRate: "",
  respiratoryRate: "",
  foodIntake: "",
  waterIntake: "",
  urination: "",
  defecation: "",
  activityLevel: "",
  medicationAdministered: "",
  proceduresPerformed: "",
  observations: "",
});

export default function HospitalizationDetailDialog({
  open,
  recordId,
  onClose,
  onChanged,
}: HospitalizationDetailDialogProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canUpdate = hasPermission(PERMISSIONS.HOSPITALIZATION.UPDATE);

  const [record, setRecord] = useState<HospitalizationRecordResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [vets, setVets] = useState<VeterinarianResponse[]>([]);
  const [form, setForm] = useState(emptyEvolutionForm());
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingEvolutionId, setDeletingEvolutionId] = useState<string | null>(null);

  const loadRecord = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await HospitalizationsService.getHospitalizationById(recordId);
      setRecord(data);
    } catch (error: unknown) {
      console.error("Error loading hospitalization record:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error al cargar el registro.");
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    HospitalizationsService.getHospitalizationById(recordId)
      .then((data) => {
        if (!cancelled) {
          setRecord(data);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        console.error("Error loading hospitalization record:", error);
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        if (!cancelled) {
          setErrorMessage(err.response?.data?.message || err.message || "Error al cargar el registro.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    VeterinariansService.getAllVeterinarians()
      .then((data) => {
        if (!cancelled) setVets(data?.results || []);
      })
      .catch((err) => console.error("Error loading veterinarians:", err));
    return () => {
      cancelled = true;
    };
  }, [open, recordId]);

  const handleAddEvolution = async () => {
    if (!form.evolutionDate || !form.evolutionDate.isValid()) {
      setAddError("La fecha de evolución es obligatoria.");
      return;
    }
    if (!form.veterinarian) {
      setAddError("Debes seleccionar el veterinario que registra la evolución.");
      return;
    }

    setAdding(true);
    setAddError(null);
    try {
      const dto: HospitalizationEvolutionRequest = {
        evolutionDate: form.evolutionDate.toISOString(),
        veterinarianId: form.veterinarian.id,
        weight: form.weight !== "" ? parseFloat(form.weight) : null,
        temperature: form.temperature !== "" ? parseFloat(form.temperature) : null,
        heartRate: form.heartRate !== "" ? parseInt(form.heartRate, 10) : null,
        respiratoryRate: form.respiratoryRate !== "" ? parseInt(form.respiratoryRate, 10) : null,
        foodIntake: form.foodIntake || null,
        waterIntake: form.waterIntake || null,
        urination: form.urination || null,
        defecation: form.defecation || null,
        activityLevel: form.activityLevel || null,
        medicationAdministered: form.medicationAdministered.trim() || null,
        proceduresPerformed: form.proceduresPerformed.trim() || null,
        observations: form.observations.trim() || null,
      };
      await HospitalizationsService.addEvolution(recordId, dto);
      setForm(emptyEvolutionForm());
      await loadRecord();
      onChanged();
    } catch (error: unknown) {
      console.error("Error adding evolution:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setAddError(err.response?.data?.message || err.message || "Error al registrar la evolución.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteEvolution = async (evolutionId: string) => {
    setDeletingEvolutionId(evolutionId);
    setAddError(null);
    try {
      await HospitalizationsService.deleteEvolution(recordId, evolutionId);
      await loadRecord();
      onChanged();
    } catch (error: unknown) {
      console.error("Error deleting evolution:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setAddError(err.response?.data?.message || err.message || "Error al eliminar la evolución.");
    } finally {
      setDeletingEvolutionId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Detalle de Hospitalización</DialogTitle>
      <DialogContent sx={{ pt: 1.5, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {!loading && record && (
          <>
            {/* Encabezado: paciente + estado */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {record.pet?.name ?? "Paciente"}{" "}
                  <Typography component="span" variant="body2" color="text.secondary">
                    ({record.pet?.species ?? ""})
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dueño: {record.pet?.owner?.fullName ?? "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ingreso: {dayjs(record.admissionDate).format("DD/MM/YYYY HH:mm")}
                  {record.dischargeDate && ` — Alta: ${dayjs(record.dischargeDate).format("DD/MM/YYYY HH:mm")}`}
                </Typography>
              </Box>
              <HospitalizationStatusChip status={record.status} />
            </Box>

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Responsable:</strong> {getUserDisplayName(record.veterinarian?.user, "Veterinario")}
              </Typography>
              {record.cageNumber && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Jaula:</strong> {record.cageNumber}
                </Typography>
              )}
            </Box>

            <Divider />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <InfoField label="Motivo de hospitalización" value={record.reason} />
              <InfoField label="Diagnóstico final" value={record.finalDiagnosis} />
              <InfoField label="Notas de alta" value={record.dischargeNotes} />
            </Box>

            <Divider />

            {/* Evoluciones */}
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
              Evoluciones ({record.evolutions.length})
            </Typography>
            {record.evolutions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sin evoluciones registradas.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {record.evolutions.map((evo) => (
                  <Box
                    key={evo.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {dayjs(evo.evolutionDate).format("DD/MM/YYYY HH:mm")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getUserDisplayName(evo.veterinarian?.user, "Veterinario")}
                        </Typography>
                      </Box>
                      {canUpdate && (
                        <Tooltip title="Eliminar evolución">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={deletingEvolutionId === evo.id}
                              onClick={() => void handleDeleteEvolution(evo.id)}
                            >
                              {deletingEvolutionId === evo.id ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <DeleteRoundedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Box>

                    {(evo.weight != null || evo.temperature != null || evo.heartRate != null || evo.respiratoryRate != null) && (
                      <Typography variant="body2" color="text.secondary">
                        {evo.weight != null && `Peso: ${evo.weight} kg  `}
                        {evo.temperature != null && `Temp: ${evo.temperature} °C  `}
                        {evo.heartRate != null && `FC: ${evo.heartRate} lpm  `}
                        {evo.respiratoryRate != null && `FR: ${evo.respiratoryRate} rpm`}
                      </Typography>
                    )}
                    {(evo.foodIntake || evo.waterIntake || evo.urination || evo.defecation || evo.activityLevel) && (
                      <Typography variant="body2" color="text.secondary">
                        {evo.foodIntake && `Alimento: ${INTAKE_LABELS[evo.foodIntake as keyof typeof INTAKE_LABELS] ?? evo.foodIntake}  `}
                        {evo.waterIntake && `Agua: ${INTAKE_LABELS[evo.waterIntake as keyof typeof INTAKE_LABELS] ?? evo.waterIntake}  `}
                        {evo.urination && `Orina: ${URINATION_LABELS[evo.urination as keyof typeof URINATION_LABELS] ?? evo.urination}  `}
                        {evo.defecation && `Deposición: ${DEFECATION_LABELS[evo.defecation as keyof typeof DEFECATION_LABELS] ?? evo.defecation}  `}
                        {evo.activityLevel && `Actividad: ${ACTIVITY_LEVEL_LABELS[evo.activityLevel as keyof typeof ACTIVITY_LEVEL_LABELS] ?? evo.activityLevel}`}
                      </Typography>
                    )}
                    <InfoField label="Medicación administrada" value={evo.medicationAdministered} />
                    <InfoField label="Procedimientos realizados" value={evo.proceduresPerformed} />
                    <InfoField label="Observaciones" value={evo.observations} />
                  </Box>
                ))}
              </Box>
            )}

            {/* Agregar evolución */}
            {canUpdate && (
              <Box
                sx={{
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Registrar evolución
                </Typography>
                {addError && <Alert severity="error">{addError}</Alert>}

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                  <DateTimePicker
                    label="Fecha y hora"
                    value={form.evolutionDate}
                    onChange={(v: Dayjs | null) => setForm((f) => ({ ...f, evolutionDate: v }))}
                    disabled={adding}
                    slotProps={{ textField: { size: "small", fullWidth: true, required: true } }}
                  />
                  <Autocomplete
                    options={vets}
                    value={form.veterinarian}
                    onChange={(_e, v) => setForm((f) => ({ ...f, veterinarian: v }))}
                    getOptionLabel={(option) => getUserDisplayName(option.user, "Veterinario")}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    disabled={adding}
                    renderInput={(params) => <TextField {...params} label="Veterinario" size="small" required />}
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5 }}>
                  <NumberInput
                    label="Peso (kg)"
                    value={form.weight !== "" ? parseFloat(form.weight) : null}
                    onChange={(v) => setForm((f) => ({ ...f, weight: v !== null ? String(v) : "" }))}
                    min={0}
                    max={300}
                    step={0.01}
                    disabled={adding}
                    size="small"
                  />
                  <NumberInput
                    label="Temp (°C)"
                    value={form.temperature !== "" ? parseFloat(form.temperature) : null}
                    onChange={(v) => setForm((f) => ({ ...f, temperature: v !== null ? String(v) : "" }))}
                    min={0}
                    max={46}
                    step={0.1}
                    disabled={adding}
                    size="small"
                  />
                  <NumberInput
                    label="FC (lpm)"
                    value={form.heartRate !== "" ? parseInt(form.heartRate, 10) : null}
                    onChange={(v) => setForm((f) => ({ ...f, heartRate: v !== null ? String(v) : "" }))}
                    min={0}
                    max={400}
                    disabled={adding}
                    size="small"
                  />
                  <NumberInput
                    label="FR (rpm)"
                    value={form.respiratoryRate !== "" ? parseInt(form.respiratoryRate, 10) : null}
                    onChange={(v) => setForm((f) => ({ ...f, respiratoryRate: v !== null ? String(v) : "" }))}
                    min={0}
                    max={200}
                    disabled={adding}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" }, gap: 1.5 }}>
                  <TextField
                    select
                    label="Alimento"
                    size="small"
                    value={form.foodIntake}
                    onChange={(e) => setForm((f) => ({ ...f, foodIntake: e.target.value }))}
                    disabled={adding}
                  >
                    <MenuItem value="">-</MenuItem>
                    {INTAKE_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o}>{INTAKE_LABELS[o]}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Agua"
                    size="small"
                    value={form.waterIntake}
                    onChange={(e) => setForm((f) => ({ ...f, waterIntake: e.target.value }))}
                    disabled={adding}
                  >
                    <MenuItem value="">-</MenuItem>
                    {INTAKE_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o}>{INTAKE_LABELS[o]}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Orina"
                    size="small"
                    value={form.urination}
                    onChange={(e) => setForm((f) => ({ ...f, urination: e.target.value }))}
                    disabled={adding}
                  >
                    <MenuItem value="">-</MenuItem>
                    {URINATION_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o}>{URINATION_LABELS[o]}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Deposición"
                    size="small"
                    value={form.defecation}
                    onChange={(e) => setForm((f) => ({ ...f, defecation: e.target.value }))}
                    disabled={adding}
                  >
                    <MenuItem value="">-</MenuItem>
                    {DEFECATION_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o}>{DEFECATION_LABELS[o]}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Actividad"
                    size="small"
                    value={form.activityLevel}
                    onChange={(e) => setForm((f) => ({ ...f, activityLevel: e.target.value }))}
                    disabled={adding}
                  >
                    <MenuItem value="">-</MenuItem>
                    {ACTIVITY_LEVEL_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o}>{ACTIVITY_LEVEL_LABELS[o]}</MenuItem>
                    ))}
                  </TextField>
                </Box>

                <TextField
                  label="Medicación administrada"
                  size="small"
                  value={form.medicationAdministered}
                  onChange={(e) => setForm((f) => ({ ...f, medicationAdministered: e.target.value }))}
                  disabled={adding}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Procedimientos realizados"
                  size="small"
                  value={form.proceduresPerformed}
                  onChange={(e) => setForm((f) => ({ ...f, proceduresPerformed: e.target.value }))}
                  disabled={adding}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Observaciones"
                  size="small"
                  value={form.observations}
                  onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
                  disabled={adding}
                  fullWidth
                  multiline
                  rows={2}
                />

                <Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={adding ? <CircularProgress size={14} color="inherit" /> : <AddRoundedIcon />}
                    disabled={adding}
                    onClick={() => void handleAddEvolution()}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Agregar evolución
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
