"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { ProfileService } from "../service/profile.service";
import { AuthService } from "@/features/auth/services/auth.service";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Completa todos los campos.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    setErrorMessage(null);
    setConfirmOpen(true);
  };

  const handleConfirmChange = async () => {
    setSaving(true);
    setErrorMessage(null);

    try {
      await ProfileService.changeMyPassword({ currentPassword, newPassword });
      // El backend invalida la sesión actual al cambiar la contraseña; se cierra sesión
      // y se redirige al login para que el usuario ingrese con la nueva contraseña.
      await AuthService.logout({ accessToken: "", refreshToken: "" });
      router.push("/login?passwordChanged=1");
    } catch (error: unknown) {
      console.error("Error changing password:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(err.response?.data?.message || err.message || "Error inesperado al cambiar la contraseña.");
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: "16px" }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Cambiar Contraseña
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Al cambiar tu contraseña se cerrará tu sesión actual y deberás iniciar sesión de nuevo.
      </Typography>

      <form noValidate onSubmit={(e) => void handleSubmit(e)}>
        {errorMessage && <Alert severity="error" sx={{ mb: 2.5 }}>{errorMessage}</Alert>}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, maxWidth: 420 }}>
          <TextField
            label="Contraseña actual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={saving}
            fullWidth
            required
            autoComplete="current-password"
          />
          <TextField
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={saving}
            fullWidth
            required
            autoComplete="new-password"
            helperText="Mínimo 6 caracteres"
          />
          <TextField
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={saving}
            fullWidth
            required
            autoComplete="new-password"
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={saving}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, minWidth: 200 }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : "Cambiar Contraseña"}
            </Button>
          </Box>
        </Box>
      </form>

      <Dialog
        open={confirmOpen}
        onClose={() => !saving && setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>¿Cambiar tu contraseña?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se cerrará tu sesión actual y serás redirigido al inicio de sesión para ingresar con la nueva contraseña.
            Si tienes cambios sin guardar en Datos Personales, guárdalos primero con &quot;Guardar Cambios&quot; o se perderán.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleConfirmChange()}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Cambiar Contraseña"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
