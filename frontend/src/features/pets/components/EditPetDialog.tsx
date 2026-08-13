"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Avatar,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PetsIcon from "@mui/icons-material/Pets";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import NumberInput from "@/shared/components/NumberInput";
import ImagePreviewDialog from "@/shared/components/ImagePreviewDialog";
import { OwnerService } from "@/features/owners/service/owners.service";
import { OwnerResponse } from "@/features/owners/type/ownersTypes";
import { PetService } from "../service/pets.service";
import { PetResponse, PetUpdateRequest } from "../type/petsTypes";

interface EditPetDialogProps {
  open: boolean;
  pet: PetResponse;
  onClose: () => void;
  onSuccess: () => void;
}

import { PET_SPECIES_OPTIONS } from "@/shared/constants/species";

const SPECIES_OPTIONS = PET_SPECIES_OPTIONS;

const SEX_OPTIONS = [
  "Macho",
  "Hembra",
];

export default function EditPetDialog({ open, pet, onClose, onSuccess }: EditPetDialogProps) {
  const [owners, setOwners] = useState<OwnerResponse[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<OwnerResponse | null>(pet?.owner || null);

  // Form fields
  const [name, setName] = useState(pet?.name || "");
  const [species, setSpecies] = useState(pet?.species || "Perro");
  const [breed, setBreed] = useState(pet?.breed || "");
  const [color, setColor] = useState(pet?.color || "");
  const [sex, setSex] = useState(pet?.sex || "Macho");
  const [birthDate, setBirthDate] = useState(pet?.birthDate || "");
  const [weight, setWeight] = useState(pet?.weight !== null && pet?.weight !== undefined ? String(pet.weight) : "");
  const [microchipNumber, setMicrochipNumber] = useState(pet?.microchipNumber || "");
  const [sterilized, setSterilized] = useState(Boolean(pet?.sterilized));
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(pet?.photoUrl || null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [specialNotes, setSpecialNotes] = useState(pet?.specialNotes || "");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const fetchOwners = async () => {
      setLoadingOwners(true);
      try {
        const data = await OwnerService.getAllOwners();
        setOwners(data || []);
      } catch (err) {
        console.error("Error loading owners list:", err);
      } finally {
        setLoadingOwners(false);
      }
    };
    void fetchOwners();
  }, [open]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      setRemovePhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOwner) {
      setErrorMessage("Debes seleccionar un cliente/dueño para la mascota.");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("El nombre de la mascota es obligatorio.");
      return;
    }
    if (!species.trim()) {
      setErrorMessage("La especie es obligatoria.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: PetUpdateRequest = {
      ownerId: selectedOwner.id,
      name: name.trim(),
      species: species.trim(),
      breed: breed.trim() || null,
      color: color.trim() || null,
      sex: sex.trim() || "Macho",
      birthDate: birthDate || null,
      weight: weight !== "" ? parseFloat(weight) : null,
      microchipNumber: microchipNumber.trim() || null,
      sterilized,
      photo,
      removePhoto: removePhoto || undefined,
      specialNotes: specialNotes.trim() || null,
    };

    try {
      await PetService.updatePet(pet.id, dto);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error updating pet:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg =
        err.response?.data?.message || err.message || "Error inesperado al actualizar la mascota.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Editar Mascota / Paciente</DialogTitle>
        <form noValidate onSubmit={(e) => void handleSubmit(e)}>
          <DialogContent sx={{ pt: 1.5, pb: 3 }}>
            {errorMessage && <Alert severity="error" sx={{ mb: 2.5 }}>{errorMessage}</Alert>}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "220px 1fr" },
                gap: 3,
                alignItems: "start",
              }}
            >
              {/* LEFT COLUMN: Large Photo Frame */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 2,
                  borderRadius: "16px",
                  bgcolor: "background.default",
                  borderColor: "divider",
                }}
              >
                <Tooltip title={photoPreview ? "Hacer clic para maximizar la imagen" : ""} arrow placement="top">
                  <Box
                    onClick={() => photoPreview && setZoomOpen(true)}
                    sx={{
                      position: "relative",
                      cursor: photoPreview ? "pointer" : "default",
                      borderRadius: "16px",
                      overflow: "hidden",
                      "&:hover .zoom-overlay": {
                        opacity: photoPreview ? 1 : 0,
                      },
                    }}
                  >
                    <Avatar
                      src={photoPreview || undefined}
                      sx={{
                        width: 140,
                        height: 140,
                        borderRadius: "16px",
                        bgcolor: photoPreview ? "transparent" : "primary.main",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                        transition: "transform 0.2s ease-in-out",
                      }}
                    >
                      {!photoPreview && <PetsIcon sx={{ fontSize: 64 }} />}
                    </Avatar>
                    {photoPreview && (
                      <Box
                        className="zoom-overlay"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          bgcolor: "rgba(0, 0, 0, 0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          opacity: 0,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        <ZoomInIcon sx={{ fontSize: 36 }} />
                      </Box>
                    )}
                  </Box>
                </Tooltip>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    startIcon={<CloudUploadIcon />}
                    disabled={saving}
                    fullWidth
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
                  >
                    {photoPreview ? "Cambiar foto" : "Subir foto"}
                    <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                  </Button>

                  {photoPreview && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemovePhoto}
                      disabled={saving}
                      fullWidth
                      sx={{ borderRadius: "8px", textTransform: "none" }}
                    >
                      Quitar foto
                    </Button>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                  Formatos permitidos: JPG, PNG. Máximo 5MB.
                </Typography>
              </Paper>

              {/* RIGHT COLUMN: Form Fields */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Section 1: Dueño */}
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                  Propietario de la Mascota
                </Typography>

                <Autocomplete
                  options={owners}
                  value={selectedOwner}
                  onChange={(_e, newValue) => setSelectedOwner(newValue)}
                  getOptionLabel={(option) => {
                    if (option.documentNumber) {
                      const docType = option.documentType || "DNI";
                      return `${option.fullName} (${docType}: ${option.documentNumber})`;
                    }
                    if (option.phone) {
                      return `${option.fullName} (Tel: ${option.phone})`;
                    }
                    return option.fullName;
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  loading={loadingOwners}
                  disabled={saving}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente / Dueño"
                      placeholder="Busca por nombre o documento..."
                      required
                    />
                  )}
                />

                <Divider sx={{ my: 0.5 }} />

                {/* Section 2: Datos de la Mascota */}
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                  Información de la Mascota
                </Typography>

                {/* Row 1: Nombre y Especie */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="Nombre de la Mascota"
                    placeholder="Ej. Firulais"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                    fullWidth
                    required
                  />
                  <TextField
                    select
                    label="Especie"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    disabled={saving}
                    fullWidth
                    required
                  >
                    {SPECIES_OPTIONS.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Row 2: Raza y Sexo */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="Raza"
                    placeholder="Ej. Golden Retriever, Mestizo, Persa"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    disabled={saving}
                    fullWidth
                  />
                  <TextField
                    select
                    label="Sexo"
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    disabled={saving}
                    fullWidth
                  >
                    {SEX_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Row 3: Fecha de Nacimiento y Peso (2 columnas amplias) */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <DatePicker
                    label="Fecha de Nacimiento"
                    value={birthDate ? dayjs(birthDate) : null}
                    onChange={(newValue: Dayjs | null) => {
                      setBirthDate(newValue && newValue.isValid() ? newValue.format("YYYY-MM-DD") : "");
                    }}
                    disabled={saving}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                  <NumberInput
                    label="Peso (Kg)"
                    placeholder="0.0"
                    value={weight !== "" ? parseFloat(weight) : null}
                    onChange={(val) => setWeight(val !== null ? String(val) : "")}
                    min={0}
                    max={300}
                    step={0.1}
                    disabled={saving}
                    fullWidth
                  />
                </Box>

                {/* Row 4: Color y Microchip */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="Color / Marcas"
                    placeholder="Ej. Marrón con blanco"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={saving}
                    fullWidth
                  />
                  <TextField
                    label="Número de Microchip"
                    placeholder="Ej. 981020000123456"
                    value={microchipNumber}
                    onChange={(e) => setMicrochipNumber(e.target.value)}
                    disabled={saving}
                    fullWidth
                  />
                </Box>

                {/* Row 5: Esterilizado */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sterilized}
                      onChange={(e) => setSterilized(e.target.checked)}
                      disabled={saving}
                      color="primary"
                    />
                  }
                  label="Esterilizado(a)"
                />

                {/* Row 6: Notas */}
                <TextField
                  label="Notas Clínicas u Observaciones"
                  placeholder="Alergias, conducta, antecedente médico..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  disabled={saving}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onClose} disabled={saving} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              variant="contained"
              sx={{ borderRadius: "8px", textTransform: "none", minWidth: 130 }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar Cambios"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Maximized Image Preview Modal */}
      <ImagePreviewDialog
        open={zoomOpen}
        src={photoPreview}
        title={name ? `Mascota: ${name}` : "Vista previa de la mascota"}
        onClose={() => setZoomOpen(false)}
      />
    </>
  );
}
