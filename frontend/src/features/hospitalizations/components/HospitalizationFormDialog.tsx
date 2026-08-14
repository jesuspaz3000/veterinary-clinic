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
import { HospitalizationsService } from "../service/hospitalizations.service";
import {
  CreateHospitalizationRecordRequest,
  UpdateHospitalizationRecordRequest,
  HOSPITALIZATION_STATUSES,
  HOSPITALIZATION_STATUS_LABELS,
} from "../type/hospitalizationsTypes";

interface HospitalizationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recordId?: string | null;
}

export default function HospitalizationFormDialog({
  open,
  onClose,
  onSuccess,
  recordId = null,
}: HospitalizationFormDialogProps) {
  const isEditing = recordId !== null;

  const [pets, setPets] = useState<PetResponse[]>([]);
  const [vets, setVets] = useState<VeterinarianResponse[]>([]);
  const [petMedicalRecords, setPetMedicalRecords] = useState<MedicalRecordResponse[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRecord, setLoadingRecord] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedPet, setSelectedPet] = useState<PetResponse | null>(null);
  const [selectedVet, setSelectedVet] = useState<VeterinarianResponse | null>(null);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<MedicalRecordResponse | null>(null);
  const [pendingMedicalRecordId, setPendingMedicalRecordId] = useState<string | null>(null);
  const [admissionDate, setAdmissionDate] = useState<Dayjs | null>(dayjs());
  const [dischargeDate, setDischargeDate] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState("");
  const [cageNumber, setCageNumber] = useState("");
  const [status, setStatus] = useState<string>("activo");
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [dischargeNotes, setDischargeNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadingData = loadingOptions || loadingRecord;

  // Carga las opciones (mascotas/veterinarios) y, si se está editando,
  // el registro de hospitalización fresco desde el backend por su ID.
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
          const data = await HospitalizationsService.getHospitalizationById(recordId);
          setSelectedPet(data.pet);
          setSelectedVet(data.veterinarian);
          setAdmissionDate(dayjs(data.admissionDate));
          setDischargeDate(data.dischargeDate ? dayjs(data.dischargeDate) : null);
          setReason(data.reason ?? "");
          setCageNumber(data.cageNumber ?? "");
          setStatus(data.status);
          setFinalDiagnosis(data.finalDiagnosis ?? "");
          setDischargeNotes(data.dischargeNotes ?? "");
          setPendingMedicalRecordId(data.medicalRecordId);
          setLoadingRecord(false);
        }
      } catch (err) {
        console.error("Error loading hospitalization form data:", err);
        if (recordId) setLoadError("No se pudo cargar la información de la hospitalización.");
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
      setErrorMessage("Debes seleccionar el veterinario responsable.");
      return;
    }
    if (!admissionDate || !admissionDate.isValid()) {
      setErrorMessage("La fecha de ingreso es obligatoria.");
      return;
    }
    if (!reason.trim()) {
      setErrorMessage("El motivo de hospitalización es obligatorio.");
      return;
    }
    if (dischargeDate && dischargeDate.isValid() && dischargeDate.isBefore(admissionDate)) {
      setErrorMessage("La fecha de alta debe ser posterior a la fecha de ingreso.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      if (isEditing && recordId) {
        const dto: UpdateHospitalizationRecordRequest = {
          petId: selectedPet.id,
          medicalRecordId: selectedMedicalRecord.id,
          admissionDate: admissionDate.toISOString(),
          dischargeDate: dischargeDate && dischargeDate.isValid() ? dischargeDate.toISOString() : null,
          reason: reason.trim(),
          cageNumber: cageNumber.trim() || null,
          veterinarianId: selectedVet.id,
          status,
          finalDiagnosis: finalDiagnosis.trim() || null,
          dischargeNotes: dischargeNotes.trim() || null,
        };
        await HospitalizationsService.updateHospitalization(recordId, dto);
      } else {
        const dto: CreateHospitalizationRecordRequest = {
          petId: selectedPet.id,
          medicalRecordId: selectedMedicalRecord.id,
          admissionDate: admissionDate.toISOString(),
          reason: reason.trim(),
          cageNumber: cageNumber.trim() || null,
          veterinarianId: selectedVet.id,
        };
        await HospitalizationsService.createHospitalization(dto);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving hospitalization record:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        err.response?.data?.message || err.message || "Error inesperado al guardar el registro."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving || loadingData ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? "Editar Hospitalización" : "Nueva Hospitalización"}
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
            Paciente y Responsable
          </Typography>

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
            fullWidth
            renderInput={(params) => (
              <TextField {...params} label="Mascota / Paciente" placeholder="Busca por nombre..." required />
            )}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
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
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
            Datos del ingreso
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <DateTimePicker
              label="Fecha y hora de ingreso"
              value={admissionDate}
              onChange={(newValue: Dayjs | null) => setAdmissionDate(newValue)}
              disabled={saving}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
            <TextField
              label="Número de jaula"
              value={cageNumber}
              onChange={(e) => setCageNumber(e.target.value)}
              disabled={saving}
              fullWidth
            />
          </Box>

          <TextField
            label="Motivo de hospitalización"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={saving}
            fullWidth
            required
            multiline
            rows={2}
          />

          {isEditing && (
            <>
              <Divider sx={{ my: 0.5 }} />

              <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                Estado y alta
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <TextField
                  select
                  label="Estado"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={saving}
                  fullWidth
                  required
                >
                  {HOSPITALIZATION_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {HOSPITALIZATION_STATUS_LABELS[s]}
                    </MenuItem>
                  ))}
                </TextField>
                <DateTimePicker
                  label="Fecha y hora de alta (opcional)"
                  value={dischargeDate}
                  onChange={(newValue: Dayjs | null) => setDischargeDate(newValue)}
                  disabled={saving}
                  slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
                />
              </Box>

              <TextField
                label="Diagnóstico final"
                value={finalDiagnosis}
                onChange={(e) => setFinalDiagnosis(e.target.value)}
                disabled={saving}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                label="Notas de alta"
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
                disabled={saving}
                fullWidth
                multiline
                rows={2}
              />
            </>
          )}
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
