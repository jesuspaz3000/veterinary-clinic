"use client";

import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Autocomplete,
  Divider,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PetService } from "@/features/pets/service/pets.service";
import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinariansService } from "@/features/veterinarians/service/veterinarians.service";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";
import { ProductsService } from "@/features/products/service/products.service";
import { ProductResponse } from "@/features/products/types/productTypes";
import { AppointmentService } from "@/features/appointments/service/appointments.service";
import { AppointmentResponse } from "@/features/appointments/type/appointmentsTypes";
import { getUserDisplayName } from "@/features/appointments/utils/professionals";
import NumberInput from "@/shared/components/NumberInput";
import { MedicalRecordsService } from "../service/medicalRecords.service";
import {
  MedicalRecordResponse,
  MedicalRecordRequest,
  MedicalRecordAppointmentPrefill,
  RECORD_TYPES,
  RECORD_TYPE_LABELS,
  RECORD_STATUSES,
  RECORD_STATUS_LABELS,
} from "../type/medicalRecordsTypes";

interface PrescriptionRow {
  key: number;
  product: ProductResponse | null;
  dosage: string;
  frequency: string;
  durationDays: string;
  instructions: string;
}

const emptyRow = (key: number): PrescriptionRow => ({
  key,
  product: null,
  dosage: "",
  frequency: "",
  durationDays: "",
  instructions: "",
});

interface MedicalRecordFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record?: MedicalRecordResponse | null;
  /** Precarga el formulario a partir de una cita recién marcada como completada */
  prefillFromAppointment?: MedicalRecordAppointmentPrefill | null;
}

export default function MedicalRecordFormDialog({
  open,
  onClose,
  onSuccess,
  record = null,
  prefillFromAppointment = null,
}: MedicalRecordFormDialogProps) {
  const isEditing = record !== null;

  const [pets, setPets] = useState<PetResponse[]>([]);
  const [vets, setVets] = useState<VeterinarianResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [petAppointments, setPetAppointments] = useState<AppointmentResponse[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [selectedPet, setSelectedPet] = useState<PetResponse | null>(
    record?.pet ?? prefillFromAppointment?.pet ?? null
  );
  const [selectedVet, setSelectedVet] = useState<VeterinarianResponse | null>(
    record?.veterinarian ?? prefillFromAppointment?.veterinarian ?? null
  );
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [recordType, setRecordType] = useState<string>(record?.recordType ?? "consulta");
  const [recordDate, setRecordDate] = useState<Dayjs | null>(
    record
      ? dayjs(record.recordDate)
      : prefillFromAppointment
        ? dayjs(`${prefillFromAppointment.date}T${prefillFromAppointment.startTime}`)
        : dayjs()
  );
  const [reason, setReason] = useState(record?.reason ?? prefillFromAppointment?.serviceType ?? "");
  const [symptoms, setSymptoms] = useState(record?.symptoms ?? "");
  const [diagnosis, setDiagnosis] = useState(record?.diagnosis ?? "");
  const [treatment, setTreatment] = useState(record?.treatment ?? "");
  const [observations, setObservations] = useState(record?.observations ?? "");
  const [weight, setWeight] = useState(record?.weight != null ? String(record.weight) : "");
  const [temperature, setTemperature] = useState(
    record?.temperature != null ? String(record.temperature) : ""
  );
  const [heartRate, setHeartRate] = useState(record?.heartRate != null ? String(record.heartRate) : "");
  const [respiratoryRate, setRespiratoryRate] = useState(
    record?.respiratoryRate != null ? String(record.respiratoryRate) : ""
  );
  const [followUpDate, setFollowUpDate] = useState<Dayjs | null>(
    record?.followUpDate ? dayjs(record.followUpDate) : null
  );
  const [status, setStatus] = useState<string>(record?.status ?? "completado");
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>(() =>
    record
      ? record.prescriptions.map((p, i) => ({
          key: i,
          product: { id: p.productId, name: p.medicationName } as ProductResponse,
          dosage: p.dosage,
          frequency: p.frequency,
          durationDays: String(p.durationDays),
          instructions: p.instructions ?? "",
        }))
      : []
  );

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [petsData, vetsData, productsData] = await Promise.all([
          PetService.getAllPets(),
          VeterinariansService.getAllVeterinarians(),
          ProductsService.getAllProducts(),
        ]);
        setPets(petsData || []);
        setVets(vetsData?.results || []);
        setProducts(productsData?.results || []);
      } catch (err) {
        console.error("Error loading options:", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    void loadOptions();
  }, [open]);

  // Cita de origen opcional: se listan las citas de la mascota seleccionada
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!selectedPet) {
        setPetAppointments([]);
        return;
      }
      try {
        const data = await AppointmentService.getAllAppointments({ petId: selectedPet.id });
        if (!cancelled) {
          setPetAppointments(data);
          if (prefillFromAppointment) {
            const match = data.find((a) => a.id === prefillFromAppointment.appointmentId) ?? null;
            setSelectedAppointment((prev) => prev ?? match);
          }
        }
      } catch (err) {
        console.error("Error loading pet appointments:", err);
        if (!cancelled) setPetAppointments([]);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedPet, prefillFromAppointment]);

  const updateRow = (key: number, patch: Partial<PrescriptionRow>) => {
    setPrescriptions((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPet) {
      setErrorMessage("Debes seleccionar una mascota.");
      return;
    }
    if (!selectedVet) {
      setErrorMessage("Debes seleccionar el veterinario responsable.");
      return;
    }
    if (!recordDate || !recordDate.isValid()) {
      setErrorMessage("La fecha del registro es obligatoria.");
      return;
    }
    for (const row of prescriptions) {
      if (!row.product || !row.dosage.trim() || !row.frequency.trim() || !row.durationDays.trim()) {
        setErrorMessage("Completa producto, dosis, frecuencia y duración en todas las prescripciones.");
        return;
      }
      if (!(parseInt(row.durationDays, 10) > 0)) {
        setErrorMessage("La duración de cada prescripción debe ser mayor a 0 días.");
        return;
      }
    }

    setSaving(true);
    setErrorMessage(null);

    const toNumber = (value: string): number | null => {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const dto: MedicalRecordRequest = {
      petId: selectedPet.id,
      veterinarianId: selectedVet.id,
      appointmentId: selectedAppointment?.id ?? null,
      recordType,
      recordDate: recordDate.toISOString(),
      reason: reason.trim() || null,
      symptoms: symptoms.trim() || null,
      diagnosis: diagnosis.trim() || null,
      treatment: treatment.trim() || null,
      observations: observations.trim() || null,
      weight: toNumber(weight),
      temperature: toNumber(temperature),
      heartRate: toNumber(heartRate),
      respiratoryRate: toNumber(respiratoryRate),
      followUpDate: followUpDate && followUpDate.isValid() ? followUpDate.format("YYYY-MM-DD") : null,
      status,
      prescriptions: prescriptions.map((row) => ({
        productId: row.product!.id,
        dosage: row.dosage.trim(),
        frequency: row.frequency.trim(),
        durationDays: parseInt(row.durationDays, 10),
        instructions: row.instructions.trim() || null,
      })),
    };

    try {
      if (isEditing) {
        await MedicalRecordsService.updateMedicalRecord(record.id, dto);
      } else {
        await MedicalRecordsService.createMedicalRecord(dto);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving medical record:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        err.response?.data?.message || err.message || "Error inesperado al guardar el registro."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? "Editar Registro Médico" : "Nuevo Registro Médico"}
      </DialogTitle>
      <IconButton
        aria-label="Cerrar"
        onClick={onClose}
        disabled={saving}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "text.secondary",
        }}
      >
        <CloseRoundedIcon />
      </IconButton>
      <form noValidate onSubmit={(e) => void handleSubmit(e)}>
        <DialogContent sx={{ pt: 1.5, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
            Paciente y Profesional
          </Typography>

          <Autocomplete
            options={pets}
            value={selectedPet}
            onChange={(_e, newValue) => {
              setSelectedPet(newValue);
              setSelectedAppointment(null);
            }}
            getOptionLabel={(option) =>
              option.owner ? `${option.name} (${option.species}) — ${option.owner.fullName}` : option.name
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={loadingOptions}
            disabled={saving}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} label="Mascota / Paciente" placeholder="Busca por nombre..." required />
            )}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Autocomplete
              options={vets}
              value={selectedVet}
              onChange={(_e, newValue) => setSelectedVet(newValue)}
              getOptionLabel={(option) => getUserDisplayName(option.user, "Veterinario")}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loadingOptions}
              disabled={saving}
              renderInput={(params) => <TextField {...params} label="Veterinario responsable" required />}
            />
            <Autocomplete
              options={petAppointments}
              value={selectedAppointment}
              onChange={(_e, newValue) => setSelectedAppointment(newValue)}
              getOptionLabel={(option) =>
                `${dayjs(option.date).format("DD/MM/YYYY")} ${option.startTime.slice(0, 5)} — ${option.serviceType}`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={saving || !selectedPet}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cita de origen (opcional)"
                  placeholder={selectedPet ? "Sin cita vinculada" : "Selecciona una mascota"}
                />
              )}
            />
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
            Datos clínicos
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              select
              label="Tipo de registro"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              disabled={saving}
              fullWidth
              required
            >
              {RECORD_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {RECORD_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
            <DateTimePicker
              label="Fecha y hora del registro"
              value={recordDate}
              onChange={(newValue: Dayjs | null) => setRecordDate(newValue)}
              disabled={saving}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
              gap: 2,
            }}
          >
            <NumberInput
              label="Peso (kg)"
              placeholder="0.0"
              value={weight !== "" ? parseFloat(weight) : null}
              onChange={(val) => setWeight(val !== null ? String(val) : "")}
              min={0}
              max={300}
              step={0.01}
              disabled={saving}
            />
            <NumberInput
              label="Temperatura (°C)"
              placeholder="38.5"
              value={temperature !== "" ? parseFloat(temperature) : null}
              onChange={(val) => setTemperature(val !== null ? String(val) : "")}
              min={0}
              max={46}
              step={0.1}
              disabled={saving}
            />
            <NumberInput
              label="FC (lpm)"
              placeholder="0"
              value={heartRate !== "" ? parseInt(heartRate, 10) : null}
              onChange={(val) => setHeartRate(val !== null ? String(val) : "")}
              min={0}
              max={400}
              disabled={saving}
            />
            <NumberInput
              label="FR (rpm)"
              placeholder="0"
              value={respiratoryRate !== "" ? parseInt(respiratoryRate, 10) : null}
              onChange={(val) => setRespiratoryRate(val !== null ? String(val) : "")}
              min={0}
              max={200}
              disabled={saving}
            />
          </Box>

          <TextField
            label="Motivo de la visita"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={saving}
            fullWidth
          />

          <TextField
            label="Síntomas"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={saving}
            fullWidth
            multiline
            rows={2}
          />

          <TextField
            label="Diagnóstico"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            disabled={saving}
            fullWidth
            multiline
            rows={2}
          />

          <TextField
            label="Tratamiento indicado"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            disabled={saving}
            fullWidth
            multiline
            rows={2}
          />

          <TextField
            label="Observaciones"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            disabled={saving}
            fullWidth
            multiline
            rows={2}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <DatePicker
              label="Fecha de seguimiento"
              value={followUpDate}
              onChange={(newValue: Dayjs | null) => setFollowUpDate(newValue)}
              disabled={saving}
              slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
            />
            <TextField
              select
              label="Estado del registro"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={saving}
              fullWidth
            >
              {RECORD_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {RECORD_STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
              Prescripciones
            </Typography>
            <Button
              size="small"
              startIcon={<AddRoundedIcon />}
              disabled={saving}
              onClick={() =>
                setPrescriptions((rows) => [
                  ...rows,
                  emptyRow(rows.length ? Math.max(...rows.map((r) => r.key)) + 1 : 0),
                ])
              }
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Agregar medicamento
            </Button>
          </Box>

          {prescriptions.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Sin prescripciones. Agrega medicamentos del inventario si el tratamiento lo requiere.
            </Typography>
          )}

          {prescriptions.map((row) => (
            <Box
              key={row.key}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr 0.7fr 40px" },
                  gap: 1.5,
                  alignItems: "center",
                }}
              >
                <Autocomplete
                  options={products}
                  value={row.product}
                  onChange={(_e, newValue) => updateRow(row.key, { product: newValue })}
                  getOptionLabel={(option) =>
                    option.activeIngredient ? `${option.name} (${option.activeIngredient})` : option.name
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  loading={loadingOptions}
                  disabled={saving}
                  renderInput={(params) => <TextField {...params} label="Producto / medicamento" size="small" />}
                />
                <TextField
                  label="Dosis"
                  placeholder="10 mg"
                  value={row.dosage}
                  onChange={(e) => updateRow(row.key, { dosage: e.target.value })}
                  disabled={saving}
                  size="small"
                />
                <TextField
                  label="Frecuencia"
                  placeholder="cada 12 h"
                  value={row.frequency}
                  onChange={(e) => updateRow(row.key, { frequency: e.target.value })}
                  disabled={saving}
                  size="small"
                />
                <NumberInput
                  label="Días"
                  value={row.durationDays !== "" ? parseInt(row.durationDays, 10) : null}
                  onChange={(val) => updateRow(row.key, { durationDays: val !== null ? String(val) : "" })}
                  min={1}
                  max={3650}
                  disabled={saving}
                  size="small"
                />
                <Tooltip title="Quitar prescripción">
                  <IconButton color="error" disabled={saving} onClick={() =>
                    setPrescriptions((rows) => rows.filter((r) => r.key !== row.key))
                  }>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                label="Instrucciones"
                placeholder="Ej. administrar con alimentos..."
                value={row.instructions}
                onChange={(e) => updateRow(row.key, { instructions: e.target.value })}
                disabled={saving}
                size="small"
                fullWidth
              />
            </Box>
          ))}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={onClose}
            disabled={saving}
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving || loadingOptions}
            variant="contained"
            sx={{ borderRadius: "8px", textTransform: "none", minWidth: 130 }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : isEditing ? "Guardar Cambios" : "Registrar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
