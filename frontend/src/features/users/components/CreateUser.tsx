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
  Tooltip,
  Paper,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PhoneInput from "@/shared/components/PhoneInput";
import ImagePreviewDialog from "@/shared/components/ImagePreviewDialog";
import { UsersService } from "../service/users.service";
import { RolesService } from "@/features/roles/services/roles.service";
import { Role } from "@/features/roles/types/rolesTypes";
import { UserCreateRequest } from "../type/usersTypes";

interface CreateUserProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUser({ open, onClose, onSuccess }: CreateUserProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const response = await RolesService.getAllRoles();
        if (isMounted) {
          setRoles(response?.results || []);
        }
      } catch (err) {
        console.error("Error loading roles list:", err);
      } finally {
        if (isMounted) {
          setLoadingRoles(false);
        }
      }
    };
    void fetchRoles();
    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setSelectedRole(null);
    setAvatar(null);
    setAvatarPreview(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim() || !selectedRole) {
      setErrorMessage("Por favor, completa los campos obligatorios (*).");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const dto: UserCreateRequest = {
      username: username.trim(),
      email: email.trim(),
      password,
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
      phone: phone.trim() || null,
      roleId: selectedRole.id,
      avatar,
    };

    try {
      await UsersService.createUser(dto);
      resetForm();
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMsg =
        err.response?.data?.message || err.message || "Error inesperado al crear el usuario.";
      setErrorMessage(apiErrorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Usuario de Sistema</DialogTitle>
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
                      {!avatarPreview && ((firstName?.charAt(0) || username.charAt(0) || "U").toUpperCase())}
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
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                  Información de Usuario y Acceso
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="Nombre de usuario"
                    placeholder="Ej. carlos_admin"
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
                    placeholder="carlos@ejemplo.com"
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
                  <TextField
                    label="Contraseña"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={saving}
                    fullWidth
                    required
                    autoComplete="new-password"
                  />
                  <PhoneInput
                    value={phone}
                    onChange={(val) => setPhone(val)}
                    disabled={saving}
                  />
                </Box>

                <Autocomplete
                  options={roles}
                  value={selectedRole}
                  onChange={(_e, newValue) => setSelectedRole(newValue)}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  loading={loadingRoles}
                  disabled={saving}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rol de Sistema"
                      placeholder="Selecciona un rol..."
                      required
                    />
                  )}
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
              {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar Usuario"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Image Preview Lightbox */}
      <ImagePreviewDialog
        open={zoomOpen}
        src={avatarPreview}
        title={username ? `Usuario: ${username}` : "Foto de perfil"}
        onClose={() => setZoomOpen(false)}
      />
    </>
  );
}
