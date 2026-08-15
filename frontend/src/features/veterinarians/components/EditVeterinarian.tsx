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
  Avatar,
  Autocomplete,
  Divider,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PhoneInput from "@/shared/components/PhoneInput";
import ImagePreviewDialog from "@/shared/components/ImagePreviewDialog";
import { VeterinariansService } from "../service/veterinarians.service";
import { SpecialtiesService } from "@/features/specialties/service/specialties.service";
import { SpecialtyResponse } from "@/features/specialties/type/specialtiesTypes";
import {
  VeterinarianResponse,
  VeterinarianUpdateRequest,
} from "../type/veterinariansTypes";
import ManageSpecialtiesDialog from "@/features/specialties/components/ManageSpecialtiesDialog";

interface EditVeterinarianProps {
  open: boolean;
  veterinarian: VeterinarianResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditVeterinarian({
  open,
  veterinarian,
  onClose,
  onSuccess,
}: EditVeterinarianProps) {
  const user = veterinarian.user;

  // Specialties state
  const [availableSpecialties, setAvailableSpecialties] = useState<SpecialtyResponse[]>([]);
  const [manageSpecialtiesOpen, setManageSpecialtiesOpen] = useState(false);

  // Form state
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const [licenseNumber, setLicenseNumber] = useState(veterinarian.licenseNumber || "");
  const [selectedSpecialties, setSelectedSpecialties] = useState<SpecialtyResponse[]>(
    veterinarian.specialties || []
  );
  const [hireDate, setHireDate] = useState<string>(veterinarian.hireDate || "");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    const fetchSpecialties = async () => {
      try {
        const data = await SpecialtiesService.getAllSpecialties();
        if (isMounted) {
          setAvailableSpecialties(data || []);
        }
      } catch (err) {
        console.error("Error loading specialties:", err);
      }
    };
    void fetchSpecialties();
    return () => {
      isMounted = false;
    };
  }, [open]);

  const loadSpecialties = async () => {
    try {
      const data = await SpecialtiesService.getAllSpecialties();
      setAvailableSpecialties(data || []);
    } catch (err) {
      console.error("Error loading specialties:", err);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
      setRemoveAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !email.trim() || !licenseNumber.trim()) {
      setErrorMessage("Por favor, completa los campos obligatorios (*).");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: VeterinarianUpdateRequest = {
      username: username.trim(),
      email: email.trim(),
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
      phone: phone.trim() || null,
      avatar,
      removeAvatar: removeAvatar || undefined,
      licenseNumber: licenseNumber.trim(),
      specialtyIds: selectedSpecialties.map((s) => s.id),
      hireDate: hireDate || null,
      status: veterinarian.status,
    };

    try {
      await VeterinariansService.updateVeterinarian(veterinarian.id, dto);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error updating veterinarian:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg =
        err.response?.data?.message || err.message || "Error inesperado al actualizar el veterinario.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Editar Veterinario</DialogTitle>
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
              {/* LEFT COLUMN: Avatar Frame Card */}
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
                <Tooltip title={avatarPreview ? "Hacer clic para maximizar la foto" : ""} arrow placement="top">
                  <Box
                    onClick={() => avatarPreview && setZoomOpen(true)}
                    sx={{
                      position: "relative",
                      cursor: avatarPreview ? "pointer" : "default",
                      borderRadius: "50%",
                      overflow: "hidden",
                      "&:hover .zoom-overlay": {
                        opacity: avatarPreview ? 1 : 0,
                      },
                    }}
                  >
                    <Avatar
                      src={avatarPreview || undefined}
                      sx={{
                        width: 130,
                        height: 130,
                        bgcolor: avatarPreview ? "transparent" : "primary.main",
                        fontSize: "3rem",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                        transition: "transform 0.2s ease-in-out",
                      }}
                    >
                      {!avatarPreview && ((firstName?.charAt(0) || username.charAt(0) || "V").toUpperCase())}
                    </Avatar>
                    {avatarPreview && (
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
                    {avatarPreview ? "Cambiar foto" : "Subir foto"}
                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                  </Button>

                  {avatarPreview && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveAvatar}
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

              {/* RIGHT COLUMN: Form Controls */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Section 1: User Info */}
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                  Información de Cuenta y Usuario
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="Nombre de usuario"
                    placeholder="Ej. dr_perez"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={saving}
                    fullWidth
                    required
                    autoComplete="new-user"
                  />
                  <TextField
                    label="Correo electrónico"
                    type="email"
                    placeholder="perez@veterinaria.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={saving}
                    fullWidth
                    required
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="Nombres"
                    placeholder="Carlos"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={saving}
                    fullWidth
                  />
                  <TextField
                    label="Apellidos"
                    placeholder="Pérez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={saving}
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <PhoneInput
                    value={phone}
                    onChange={(val) => setPhone(val)}
                    disabled={saving}
                  />
                </Box>

                <Divider sx={{ my: 0.5 }} />

                {/* Section 2: Veterinarian Profile */}
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                  Perfil Profesional del Veterinario
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="N° Licencia / Colegiatura"
                    placeholder="CMVP-12345"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    disabled={saving}
                    fullWidth
                    required
                  />
                  <DatePicker
                    label="Fecha de Contratación"
                    value={hireDate ? dayjs(hireDate) : null}
                    onChange={(newValue: Dayjs | null) => {
                      setHireDate(newValue && newValue.isValid() ? newValue.format("YYYY-MM-DD") : "");
                    }}
                    disabled={saving}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <Autocomplete
                    multiple
                    options={availableSpecialties}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, val) => option.id === val.id}
                    value={selectedSpecialties}
                    onChange={(_e, newValue) => setSelectedSpecialties(newValue)}
                    disabled={saving}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Especialidades"
                        placeholder="Selecciona una o más especialidades..."
                      />
                    )}
                  />
                  <Tooltip title="Gestionar catálogo de especialidades">
                    <IconButton
                      color="primary"
                      onClick={() => setManageSpecialtiesOpen(true)}
                      disabled={saving}
                      sx={{ mt: 1, bgcolor: "action.hover" }}
                    >
                      <SettingsRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
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

      {/* Specialties Management Modal */}
      <ManageSpecialtiesDialog
        open={manageSpecialtiesOpen}
        onClose={() => setManageSpecialtiesOpen(false)}
        onUpdated={() => void loadSpecialties()}
      />

      {/* Image Preview Lightbox */}
      <ImagePreviewDialog
        open={zoomOpen}
        src={avatarPreview}
        title={username ? `Veterinario: ${username}` : "Foto de perfil"}
        onClose={() => setZoomOpen(false)}
      />
    </>
  );
}
