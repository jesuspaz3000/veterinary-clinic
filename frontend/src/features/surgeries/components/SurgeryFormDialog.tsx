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
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { PetService } from "@/features/pets/service/pets.service";
import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinariansService } from "@/features/veterinarians/service/veterinarians.service";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";
import { MedicalRecordsService } from "@/features/medical-records/service/medicalRecords.service";
import { MedicalRecordResponse, RECORD_TYPE_LABELS } from "@/features/medical-records/type/medicalRecordsTypes";
import { getUserDisplayName } from "@/features/appointments/utils/professionals";
import NumberInput from "@/shared/components/NumberInput";
import { SurgeriesService } from "../service/surgeries.service";
import {
  SurgeryRecordRequest,
  SURGERY_TYPES,
  SURGERY_TYPE_LABELS,
  SURGERY_STATUSES,
  SURGERY_STATUS_LABELS,
} from "../type/surgeriesTypes";

interface SurgeryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recordId?: string | null;
}

export default function SurgeryFormDialog({
  open,
  onClose,
  onSuccess,
  recordId = null,
}: SurgeryFormDialogProps) {
  const isEditing = recordId !== null;

  const [pets, setPets] = useState<PetResponse[]>([]);
  const [vets, setVets] = useState<VeterinarianResponse[]>([]);
  const [petMedicalRecords, setPetMedicalRecords] = useState<MedicalRecordResponse[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRecord, setLoadingRecord] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedPet, setSelectedPet] = useState<PetResponse | null>(null);
  const [selectedVet, setSelectedVet] = useState<VeterinarianResponse | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<VeterinarianResponse | null>(null);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<MedicalRecordResponse | null>(null);
  const [pendingMedicalRecordId, setPendingMedicalRecordId] = useState<string | null>(null);
  const [surgeryType, setSurgeryType] = useState<string>("esterilizacion");
  const [surgeryDate, setSurgeryDate] = useState<Dayjs | null>(dayjs());
  const [anesthesiaType, setAnesthesiaType] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [status, setStatus] = useState<string>("programada");
  const [preSurgeryNotes, setPreSurgeryNotes] = useState("");
  const [surgeryNotes, setSurgeryNotes] = useState("");
  const [postSurgeryNotes, setPostSurgeryNotes] = useState("");
  const [complications, setComplications] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadingData = loadingOptions || loadingRecord;

  // Carga las opciones (mascotas/veterinarios) y, si se está editando,
  // el registro de cirugía fresco desde el backend por su ID.
  useEffect(() => {
    if (!open) return;
    const loadData = async () => {
      setLoadingOptions(true);
      setLoadError(null);
      try {
        const [petsData, vetsData] = await Promise.all([
          PetService.getAllPets(),
          VeterinariansService.getAllVeterinarians(),
        ]);
        setPets(petsData || []);
        setVets(vetsData?.results || []);

        if (recordId) {
          setLoadingRecord(true);
          const data = await SurgeriesService.getSurgeryRecordById(recordId);
          setSelectedPet(data.pet);
          setSelectedVet(data.veterinarian);
          setSelectedAssistant(data.assistantVeterinarian);
          setSurgeryType(data.surgeryType);
          setSurgeryDate(dayjs(data.surgeryDate));
          setAnesthesiaType(data.anesthesiaType ?? "");
          setDurationMinutes(data.durationMinutes != null ? String(data.durationMinutes) : "");
          setStatus(data.status);
          setPreSurgeryNotes(data.preSurgeryNotes ?? "");
          setSurgeryNotes(data.surgeryNotes ?? "");
          setPostSurgeryNotes(data.postSurgeryNotes ?? "");
          setComplications(data.complications ?? "");
          setPendingMedicalRecordId(data.medicalRecordId);
          setLoadingRecord(false);
        }
      } catch (err) {
        console.error("Error loading surgery form data:", err);
        if (recordId) setLoadError("No se pudo cargar la información de la cirugía.");
        setLoadingRecord(false);
      } finally {
        setLoadingOptions(false);
      }
    };
    void loadData();
  }, [open, recordId]);

  // Registro médico de origen: se listan los registros de la mascota seleccionada
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!selectedPet) {
        setPetMedicalRecords([]);
        return;
      }
      try {
        const data = await MedicalRecordsService.getMedicalRecords({ petId: selectedPet.id, limit: 100 });
        if (!cancelled) {
          setPetMedicalRecords(data.results || []);
          if (pendingMedicalRecordId) {
            const match = data.results.find((r) => r.id === pendingMedicalRecordId);
            if (match) setSelectedMedicalRecord(match);
          }
        }
      } catch (err) {
        console.error("Error loading pet medical records:", err);
        if (!cancelled) setPetMedicalRecords([]);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPet]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPet) {
      setErrorMessage("Debes seleccionar una mascota.");
      return;
    }
    if (!selectedMedicalRecord) {
      setErrorMessage("Debes vincular un registro médico de la mascota.");
      return;
    }
    if (!selectedVet) {
      setErrorMessage("Debes seleccionar el cirujano principal.");
      return;
    }
    if (selectedAssistant && selectedAssistant.id === selectedVet.id) {
      setErrorMessage("El veterinario asistente debe ser distinto al cirujano principal.");
      return;
    }
    if (!surgeryDate || !surgeryDate.isValid()) {
      setErrorMessage("La fecha de la cirugía es obligatoria.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: SurgeryRecordRequest = {
      petId: selectedPet.id,
      medicalRecordId: selectedMedicalRecord.id,
      surgeryType,
      surgeryDate: surgeryDate.toISOString(),
      veterinarianId: selectedVet.id,
      assistantVeterinarianId: selectedAssistant?.id ?? null,
      anesthesiaType: anesthesiaType.trim() || null,
      durationMinutes: durationMinutes !== "" ? parseInt(durationMinutes, 10) : null,
      preSurgeryNotes: preSurgeryNotes.trim() || null,
      surgeryNotes: surgeryNotes.trim() || null,
      postSurgeryNotes: postSurgeryNotes.trim() || null,
      complications: complications.trim() || null,
      status,
    };

    try {
      if (isEditing && recordId) {
        await SurgeriesService.updateSurgeryRecord(recordId, dto);
      } else {
        await SurgeriesService.createSurgeryRecord(dto);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving surgery record:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        err.response?.data?.message || err.message || "Error inesperado al guardar el registro."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving || loadingData ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? "Editar Cirugía" : "Nueva Cirugía"}
      </DialogTitle>
      <form noValidate onSubmit={(e) => void handleSubmit(e)}>
        <DialogContent sx={{ pt: 1.5, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {loadError ? (
            <Alert severity="error">{loadError}</Alert>
          ) : loadingRecord ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
            Paciente y Cirujanos
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Autocomplete
              options={pets}
              value={selectedPet}
              onChange={(_e, newValue) => {
                setSelectedPet(newValue);
                setSelectedMedicalRecord(null);
              }}
              getOptionLabel={(option) =>
                option.owner ? `${option.name} (${option.species}) — ${option.owner.fullName}` : option.name
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loadingOptions}
              disabled={saving}
              renderInput={(params) => (
                <TextField {...params} label="Mascota / Paciente" placeholder="Busca por nombre..." required />
              )}
            />
            <Autocomplete
              options={petMedicalRecords}
              value={selectedMedicalRecord}
              onChange={(_e, newValue) => setSelectedMedicalRecord(newValue)}
              getOptionLabel={(option) =>
                `${dayjs(option.recordDate).format("DD/MM/YYYY")} — ${RECORD_TYPE_LABELS[option.recordType] ?? option.recordType}`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={saving || !selectedPet}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Registro médico asociado"
                  placeholder={selectedPet ? "Selecciona un registro" : "Selecciona una mascota"}
                  required
                />
              )}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Autocomplete
              options={vets}
              value={selectedVet}
              onChange={(_e, newValue) => setSelectedVet(newValue)}
              getOptionLabel={(option) => getUserDisplayName(option.user, "Veterinario")}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loadingOptions}
              disabled={saving}
              renderInput={(params) => <TextField {...params} label="Cirujano principal" required />}
            />
            <Autocomplete
              options={vets}
              value={selectedAssistant}
              onChange={(_e, newValue) => setSelectedAssistant(newValue)}
              getOptionLabel={(option) => getUserDisplayName(option.user, "Veterinario")}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loadingOptions}
              disabled={saving}
              renderInput={(params) => (
                <TextField {...params} label="Veterinario asistente (opcional)" placeholder="Sin asignar" />
              )}
            />
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
            Datos de la cirugía
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              select
              label="Tipo de cirugía"
              value={surgeryType}
              onChange={(e) => setSurgeryType(e.target.value)}
              disabled={saving}
              fullWidth
              required
            >
              {SURGERY_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {SURGERY_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
            <DateTimePicker
              label="Fecha y hora de la cirugía"
              value={surgeryDate}
              onChange={(newValue: Dayjs | null) => setSurgeryDate(newValue)}
              disabled={saving}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Tipo de anestesia"
              value={anesthesiaType}
              onChange={(e) => setAnesthesiaType(e.target.value)}
              disabled={saving}
              fullWidth
            />
            <NumberInput
              label="Duración (min)"
              placeholder="0"
              value={durationMinutes !== "" ? parseInt(durationMinutes, 10) : null}
              onChange={(val) => setDurationMinutes(val !== null ? String(val) : "")}
              min={1}
              max={1440}
              disabled={saving}
            />
            <TextField
              select
              label="Estado"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={saving}
              fullWidth
              required
            >
              {SURGERY_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {SURGERY_STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
            Notas clínicas
          </Typography>

          <TextField
            label="Notas prequirúrgicas"
            value={preSurgeryNotes}
            onChange={(e) => setPreSurgeryNotes(e.target.value)}
            disabled={saving}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Notas de la cirugía"
            value={surgeryNotes}
            onChange={(e) => setSurgeryNotes(e.target.value)}
            disabled={saving}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Notas postquirúrgicas"
            value={postSurgeryNotes}
            onChange={(e) => setPostSurgeryNotes(e.target.value)}
            disabled={saving}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Complicaciones"
            value={complications}
            onChange={(e) => setComplications(e.target.value)}
            disabled={saving}
            fullWidth
            multiline
            rows={2}
          />
            </>
          )}
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
            disabled={saving || loadingData}
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
