"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tooltip,
  Avatar,
  CircularProgress,
  Alert,
  Skeleton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import PhoneInput from "@/shared/components/PhoneInput";
import ImagePreviewDialog from "@/shared/components/ImagePreviewDialog";
import { useAuthStore } from "@/store/auth.store";
import { ProfileService } from "../service/profile.service";
import { UpdateMyProfileRequest } from "../type/profileTypes";

export default function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setSession = useAuthStore((s) => s.setSession);

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (user && !initializedRef.current) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
      setAvatarPreview(user.avatarUrl || null);
      initializedRef.current = true;
    }
  }, [user]);

  if (!hasHydrated) {
    return (
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: "16px" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
          Datos Personales
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "200px 1fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
            <Skeleton variant="circular" width={120} height={120} />
            <Skeleton variant="rounded" width="100%" height={32} sx={{ borderRadius: "8px" }} />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  }

  if (!user) return null;

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
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
      setErrorMessage("Completa los campos obligatorios (*).");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const dto: UpdateMyProfileRequest = {
      username: username.trim(),
      email: email.trim(),
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
      phone: phone.trim() || null,
      avatar,
      removeAvatar: removeAvatar || undefined,
    };

    try {
      const updated = await ProfileService.updateMyProfile(dto);
      setSession({ ...user, ...updated });
      setAvatar(null);
      setRemoveAvatar(false);
      setSuccessMessage("Perfil actualizado correctamente.");
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error inesperado al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: "16px" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
          Datos Personales
        </Typography>

        <form noValidate onSubmit={(e) => void handleSubmit(e)}>
          {errorMessage && <Alert severity="error" sx={{ mb: 2.5 }}>{errorMessage}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "200px 1fr" },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* Avatar */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Tooltip title={avatarPreview ? "Hacer clic para maximizar la foto" : ""} arrow placement="top">
                <Box
                  onClick={() => avatarPreview && setZoomOpen(true)}
                  sx={{
                    position: "relative",
                    cursor: avatarPreview ? "pointer" : "default",
                    borderRadius: "50%",
                    overflow: "hidden",
                    "&:hover .zoom-overlay": { opacity: avatarPreview ? 1 : 0 },
                  }}
                >
                  <Avatar
                    src={avatarPreview || undefined}
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: avatarPreview ? "transparent" : "primary.main",
                      fontSize: "2.75rem",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    }}
                  >
                    {!avatarPreview && (firstName?.charAt(0) || username.charAt(0) || "U").toUpperCase()}
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
                      <ZoomInIcon sx={{ fontSize: 32 }} />
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
                    variant="outlined"
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
            </Box>

            {/* Form fields */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <TextField
                  label="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={saving}
                  fullWidth
                  required
                />
                <TextField
                  label="Correo electrónico"
                  type="email"
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={saving}
                  fullWidth
                />
                <TextField
                  label="Apellidos"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={saving}
                  fullWidth
                />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <PhoneInput value={phone} onChange={(val) => setPhone(val)} disabled={saving} />
                <TextField label="Rol" value={user.role} disabled fullWidth />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, minWidth: 160 }}
                >
                  {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar Cambios"}
                </Button>
              </Box>
            </Box>
          </Box>
        </form>
      </Paper>

      <ImagePreviewDialog
        open={zoomOpen}
        src={avatarPreview}
        title={username ? `Usuario: ${username}` : "Foto de perfil"}
        onClose={() => setZoomOpen(false)}
      />
    </>
  );
}
