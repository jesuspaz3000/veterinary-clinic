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
import PhoneInput from "@/shared/components/PhoneInput";
import ImagePreviewDialog from "@/shared/components/ImagePreviewDialog";
import NumberInput from "@/shared/components/NumberInput";
import { GroomingService } from "../service/grooming.service";
import { GroomingSpecialtiesService } from "../service/groomingSpecialties.service";
import {
  GroomingStaffResponse,
  GroomingStaffUpdateRequest,
} from "../type/groomingTypes";
import { GroomingSpecialtyResponse } from "../type/groomingSpecialtiesTypes";
import ManageGroomingSpecialtiesDialog from "./ManageGroomingSpecialtiesDialog";

interface EditGroomingStaffProps {
  open: boolean;
  staff: GroomingStaffResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditGroomingStaff({
  open,
  staff,
  onClose,
  onSuccess,
}: EditGroomingStaffProps) {
  const user = staff.user;

  // Catalog state
  const [specialties, setSpecialties] = useState<GroomingSpecialtyResponse[]>([]);
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

  const [experienceYears, setExperienceYears] = useState<string>(
    staff.experienceYears !== null && staff.experienceYears !== undefined ? String(staff.experienceYears) : ""
  );
  const [hireDate, setHireDate] = useState<string>(staff.hireDate || "");
  const [selectedSpecialties, setSelectedSpecialties] = useState<GroomingSpecialtyResponse[]>(
    staff.specialties || []
  );

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    const fetchSpecialties = async () => {
      try {
        const data = await GroomingSpecialtiesService.getAllSpecialties();
        if (isMounted) {
          setSpecialties(data || []);
        }
      } catch (err) {
        console.error("Error loading grooming specialties:", err);
      }
    };
    void fetchSpecialties();
    return () => {
      isMounted = false;
    };
  }, [open]);

  const loadSpecialties = async () => {
    try {
      const data = await GroomingSpecialtiesService.getAllSpecialties();
      setSpecialties(data || []);
    } catch (err) {
      console.error("Error loading grooming specialties:", err);
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
    if (!username.trim() || !email.trim()) {
      setErrorMessage("Por favor, completa los campos obligatorios (*).");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: GroomingStaffUpdateRequest = {
      username: username.trim(),
      email: email.trim(),
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
      phone: phone.trim() || null,
      avatar,
      removeAvatar: removeAvatar || undefined,
      specialtyIds: selectedSpecialties.map((s) => s.id),
      experienceYears: experienceYears !== "" ? parseInt(experienceYears, 10) : null,
      hireDate: hireDate || null,
      status: staff.status || "activo",
    };

    try {
      await GroomingService.updateGroomingStaff(staff.id, dto);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error updating grooming staff:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg =
        err.response?.data?.message || err.message || "Error inesperado al actualizar personal de grooming.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Editar Personal de Grooming / Estética</DialogTitle>
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
                      {!avatarPreview && ((firstName?.charAt(0) || username.charAt(0) || "G").toUpperCase())}
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
                    placeholder="Ej. groomer_ana"
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
                    placeholder="ana@veterinaria.com"
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
                    placeholder="Ana"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={saving}
                    fullWidth
                  />
                  <TextField
                    label="Apellidos"
                    placeholder="Gómez"
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

                {/* Section 2: Grooming Specialties & Experience */}
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                  Perfil Profesional de Grooming / Estética
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <NumberInput
                    label="Años de Experiencia"
                    placeholder="Ej. 3"
                    value={experienceYears !== "" ? parseInt(experienceYears, 10) : null}
                    onChange={(val) => setExperienceYears(val !== null ? String(val) : "")}
                    min={0}
                    max={50}
                    step={1}
                    disabled={saving}
                    fullWidth
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
                    options={specialties}
                    value={selectedSpecialties}
                    onChange={(_e, newValue) => setSelectedSpecialties(newValue)}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    disabled={saving}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Especialidades de Estética"
                        placeholder="Corte comercial, Baño medicado..."
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

      {/* Catalog Modal */}
      <ManageGroomingSpecialtiesDialog
        open={manageSpecialtiesOpen}
        onClose={() => setManageSpecialtiesOpen(false)}
        onSpecialtyChange={() => void loadSpecialties()}
      />

      {/* Image Preview Lightbox */}
      <ImagePreviewDialog
        open={zoomOpen}
        src={avatarPreview}
        title={username ? `Groomer: ${username}` : "Foto de perfil"}
        onClose={() => setZoomOpen(false)}
      />
    </>
  );
}
