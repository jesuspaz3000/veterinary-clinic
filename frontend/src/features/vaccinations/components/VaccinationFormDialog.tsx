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
  Box,
  CircularProgress,
  Alert,
  Autocomplete,
  Divider,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PetService } from "@/features/pets/service/pets.service";
import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinariansService } from "@/features/veterinarians/service/veterinarians.service";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";
import { ProductsService } from "@/features/products/service/products.service";
import { MedicalRecordsService } from "@/features/medical-records/service/medicalRecords.service";
import { MedicalRecordResponse, RECORD_TYPE_LABELS } from "@/features/medical-records/type/medicalRecordsTypes";
import { getUserDisplayName } from "@/features/appointments/utils/professionals";
import { VaccinationsService } from "../service/vaccinations.service";
import { VaccinationRecordRequest } from "../type/vaccinationsTypes";

interface VaccinationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recordId?: string | null;
}

interface ProductVariantOption {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  stock: number;
}

export default function VaccinationFormDialog({
  open,
  onClose,
  onSuccess,
  recordId = null,
}: VaccinationFormDialogProps) {
  const isEditing = recordId !== null;

  const [pets, setPets] = useState<PetResponse[]>([]);
  const [vets, setVets] = useState<VeterinarianResponse[]>([]);
  const [variantOptions, setVariantOptions] = useState<ProductVariantOption[]>([]);
  const [petMedicalRecords, setPetMedicalRecords] = useState<MedicalRecordResponse[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRecord, setLoadingRecord] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedPet, setSelectedPet] = useState<PetResponse | null>(null);
  const [selectedVet, setSelectedVet] = useState<VeterinarianResponse | null>(null);
  const [selectedVariantOption, setSelectedVariantOption] = useState<ProductVariantOption | null>(null);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<MedicalRecordResponse | null>(null);
  const [pendingMedicalRecordId, setPendingMedicalRecordId] = useState<string | null>(null);
  const [batchNumber, setBatchNumber] = useState("");
  const [applicationDate, setApplicationDate] = useState<Dayjs | null>(dayjs());
  const [nextDoseDate, setNextDoseDate] = useState<Dayjs | null>(null);
  const [observations, setObservations] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadingData = loadingOptions || loadingRecord;

  // Carga las opciones (mascotas/veterinarios/productos) y, si se está editando,
  // el registro de vacunación fresco desde el backend por su ID.
  useEffect(() => {
    if (!open) return;
    const loadData = async () => {
      setLoadingOptions(true);
      setLoadError(null);
      try {
        const [petsData, vetsData, productsData] = await Promise.all([
          PetService.getAllPets(),
          VeterinariansService.getAllVeterinarians(),
          ProductsService.getAllProducts(),
        ]);
        setPets(petsData || []);
        setVets(vetsData?.results || []);

        const options: ProductVariantOption[] = [];
        (productsData?.results || []).forEach((prod) => {
          (prod.variants || []).forEach((v) => {
            if (!v.isActive) return;
            // Solo presentaciones inyectables pueden aplicarse como vacuna
            if (v.administrationRoute !== "inyectable") return;
            options.push({
              productId: prod.id,
              productName: prod.brand ? `${prod.name} (${prod.brand.name})` : prod.name,
              variantId: v.id,
              variantName: v.name,
              stock: v.stock,
            });
          });
        });
        setVariantOptions(options);

        if (recordId) {
          setLoadingRecord(true);
          const data = await VaccinationsService.getVaccinationRecordById(recordId);
          setSelectedPet(data.pet);
          setSelectedVet(data.veterinarian);
          const matchedVariant = data.productVariantId
            ? options.find((o) => o.variantId === data.productVariantId) ?? {
                productId: data.productId,
                productName: data.vaccineBrand ? `${data.vaccineName} (${data.vaccineBrand})` : data.vaccineName,
                variantId: data.productVariantId,
                variantName: data.productVariantName ?? "",
                stock: 0,
              }
            : null;
          setSelectedVariantOption(matchedVariant);
          setBatchNumber(data.batchNumber ?? "");
          setApplicationDate(dayjs(data.applicationDate));
          setNextDoseDate(data.nextDoseDate ? dayjs(data.nextDoseDate) : null);
          setObservations(data.observations ?? "");
          setPendingMedicalRecordId(data.medicalRecordId);
          setLoadingRecord(false);
        }
      } catch (err) {
        console.error("Error loading vaccination form data:", err);
        if (recordId) setLoadError("No se pudo cargar la información de la vacunación.");
        setLoadingRecord(false);
      } finally {
        setLoadingOptions(false);
      }
    };
    void loadData();
  }, [open, recordId]);

  // Registro médico de origen opcional: se listan los registros de la mascota seleccionada
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
    if (!selectedVet) {
      setErrorMessage("Debes seleccionar el veterinario responsable.");
      return;
    }
    if (!selectedVariantOption) {
      setErrorMessage("Debes seleccionar la vacuna/producto aplicado.");
      return;
    }
    if (!applicationDate || !applicationDate.isValid()) {
      setErrorMessage("La fecha de aplicación es obligatoria.");
      return;
    }
    if (nextDoseDate && nextDoseDate.isValid() && !nextDoseDate.isAfter(applicationDate, "day")) {
      setErrorMessage("La fecha de la próxima dosis debe ser posterior a la fecha de aplicación.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: VaccinationRecordRequest = {
      petId: selectedPet.id,
      medicalRecordId: selectedMedicalRecord?.id ?? null,
      productId: selectedVariantOption.productId,
      ...(!isEditing ? { productVariantId: selectedVariantOption.variantId } : {}),
      veterinarianId: selectedVet.id,
      batchNumber: batchNumber.trim() || null,
      applicationDate: applicationDate.format("YYYY-MM-DD"),
      nextDoseDate: nextDoseDate && nextDoseDate.isValid() ? nextDoseDate.format("YYYY-MM-DD") : null,
      observations: observations.trim() || null,
    };

    try {
      if (isEditing && recordId) {
        await VaccinationsService.updateVaccinationRecord(recordId, dto);
      } else {
        await VaccinationsService.createVaccinationRecord(dto);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving vaccination record:", error);
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
        {isEditing ? "Editar Vacunación" : "Nueva Vacunación"}
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
            Paciente y Profesional
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
                  label="Registro médico de origen (opcional)"
                  placeholder={selectedPet ? "Sin registro vinculado" : "Selecciona una mascota"}
                />
              )}
            />
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
            Datos de la vacuna
          </Typography>

          {isEditing ? (
            <TextField
              label="Vacuna / producto aplicado"
              value={
                selectedVariantOption
                  ? `${selectedVariantOption.productName} — ${selectedVariantOption.variantName}`
                  : ""
              }
              disabled
              fullWidth
              helperText="El producto/presentación queda fijo una vez aplicada la vacuna (ya se descontó del stock)."
            />
          ) : (
            <Autocomplete
              options={variantOptions}
              value={selectedVariantOption}
              onChange={(_e, newValue) => setSelectedVariantOption(newValue)}
              getOptionLabel={(option) => `${option.productName} — ${option.variantName} (stock: ${option.stock})`}
              isOptionEqualToValue={(option, value) => option.variantId === value.variantId}
              loading={loadingOptions}
              disabled={saving}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label="Vacuna / producto aplicado" placeholder="Busca por producto..." required />
              )}
            />
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Número de lote"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              disabled={saving}
              fullWidth
            />
            <DatePicker
              label="Fecha de aplicación"
              value={applicationDate}
              onChange={(newValue: Dayjs | null) => setApplicationDate(newValue)}
              disabled={saving}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
          </Box>

          <DatePicker
            label="Próxima dosis (opcional)"
            value={nextDoseDate}
            onChange={(newValue: Dayjs | null) => setNextDoseDate(newValue)}
            disabled={saving}
            slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
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
