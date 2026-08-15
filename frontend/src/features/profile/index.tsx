"use client";

import { Box, Typography } from "@mui/material";
import ProfileForm from "./components/ProfileForm";
import ChangePasswordForm from "./components/ChangePasswordForm";

export default function ProfileFeature() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700, color: "text.primary", mb: 1, letterSpacing: "-0.02em" }}
        >
          Mi Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra tus datos personales, tu foto y tu contraseña de acceso.
        </Typography>
      </Box>

      <ProfileForm />
      <ChangePasswordForm />
    </Box>
  );
}
