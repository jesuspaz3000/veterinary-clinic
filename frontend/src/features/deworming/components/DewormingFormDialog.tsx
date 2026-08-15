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
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PetService } from "@/features/pets/service/pets.service";
import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinariansService } from "@/features/veterinarians/service/veterinarians.service";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";
import { ProductsService } from "@/features/products/service/products.service";
import { MedicalRecordsService } from "@/features/medical-records/service/medicalRecords.service";
import { MedicalRecordResponse, RECORD_TYPE_LABELS } from "@/features/medical-records/type/medicalRecordsTypes";
import { getUserDisplayName } from "@/features/appointments/utils/professionals";
import { DewormingService } from "../service/deworming.service";
import { DewormingRecordRequest, DEWORMING_TYPES, DEWORMING_TYPE_LABELS } from "../type/dewormingTypes";

interface DewormingFormDialogProps {
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

export default function DewormingFormDialog({
  open,
  onClose,
  onSuccess,
  recordId = null,
}: DewormingFormDialogProps) {
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
  const [dewormingType, setDewormingType] = useState<string>("interna");
  const [dosage, setDosage] = useState("");
  const [applicationDate, setApplicationDate] = useState<Dayjs | null>(dayjs());
  const [nextApplicationDate, setNextApplicationDate] = useState<Dayjs | null>(null);
  const [observations, setObservations] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadingData = loadingOptions || loadingRecord;

  // Carga las opciones (mascotas/veterinarios/productos) y, si se está editando,
  // el registro de desparasitación fresco desde el backend por su ID.
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
          const data = await DewormingService.getDewormingRecordById(recordId);
          setSelectedPet(data.pet);
          setSelectedVet(data.veterinarian);
          const matchedVariant = data.productVariantId
            ? options.find((o) => o.variantId === data.productVariantId) ?? {
                productId: data.productId,
                productName: data.productBrand ? `${data.productName} (${data.productBrand})` : data.productName,
                variantId: data.productVariantId,
                variantName: data.productVariantName ?? "",
                stock: 0,
              }
            : null;
          setSelectedVariantOption(matchedVariant);
          setDewormingType(data.dewormingType);
          setDosage(data.dosage ?? "");
          setApplicationDate(dayjs(data.applicationDate));
          setNextApplicationDate(data.nextApplicationDate ? dayjs(data.nextApplicationDate) : null);
          setObservations(data.observations ?? "");
          setPendingMedicalRecordId(data.medicalRecordId);
          setLoadingRecord(false);
        }
      } catch (err) {
        console.error("Error loading deworming form data:", err);
        if (recordId) setLoadError("No se pudo cargar la información de la desparasitación.");
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
      setErrorMessage("Debes seleccionar el producto antiparasitario aplicado.");
      return;
    }
    if (!dosage.trim()) {
      setErrorMessage("La dosis es obligatoria.");
      return;
    }
    if (!applicationDate || !applicationDate.isValid()) {
      setErrorMessage("La fecha de aplicación es obligatoria.");
      return;
    }
    if (nextApplicationDate && nextApplicationDate.isValid() && !nextApplicationDate.isAfter(applicationDate, "day")) {
      setErrorMessage("La fecha de la próxima aplicación debe ser posterior a la fecha de aplicación.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: DewormingRecordRequest = {
      petId: selectedPet.id,
      medicalRecordId: selectedMedicalRecord?.id ?? null,
      productId: selectedVariantOption.productId,
      ...(!isEditing ? { productVariantId: selectedVariantOption.variantId } : {}),
      veterinarianId: selectedVet.id,
      dosage: dosage.trim(),
      applicationDate: applicationDate.format("YYYY-MM-DD"),
      nextApplicationDate:
        nextApplicationDate && nextApplicationDate.isValid() ? nextApplicationDate.format("YYYY-MM-DD") : null,
      dewormingType,
      observations: observations.trim() || null,
    };

    try {
      if (isEditing && recordId) {
        await DewormingService.updateDewormingRecord(recordId, dto);
      } else {
        await DewormingService.createDewormingRecord(dto);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving deworming record:", error);
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
        {isEditing ? "Editar Desparasitación" : "Nueva Desparasitación"}
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
            Datos de la desparasitación
          </Typography>

          {isEditing ? (
            <TextField
              label="Producto antiparasitario"
              value={
                selectedVariantOption
                  ? `${selectedVariantOption.productName} — ${selectedVariantOption.variantName}`
                  : ""
              }
              disabled
              fullWidth
              helperText="El producto/presentación queda fijo una vez aplicado (ya se descontó del stock)."
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
                <TextField {...params} label="Producto antiparasitario" placeholder="Busca por producto..." required />
              )}
            />
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              select
              label="Tipo"
              value={dewormingType}
              onChange={(e) => setDewormingType(e.target.value)}
              disabled={saving}
              fullWidth
              required
            >
              {DEWORMING_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {DEWORMING_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Dosis"
              placeholder="Ej. 1 tableta / 10 kg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              disabled={saving}
              fullWidth
              required
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <DatePicker
              label="Fecha de aplicación"
              value={applicationDate}
              onChange={(newValue: Dayjs | null) => setApplicationDate(newValue)}
              disabled={saving}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
            <DatePicker
              label="Próxima aplicación (opcional)"
              value={nextApplicationDate}
              onChange={(newValue: Dayjs | null) => setNextApplicationDate(newValue)}
              disabled={saving}
              slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
            />
          </Box>

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
