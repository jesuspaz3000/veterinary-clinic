"use client";

import { Box, Typography } from "@mui/material";
import VeterinariansTable from "./components/VeterinariansTable";

export default function VeterinariansFeature() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Title Header */}
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Veterinarios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona el equipo médico veterinario, sus licencias colegiales, especialidades y datos de contacto.
        </Typography>
      </Box>

      {/* Veterinarians Table */}
      <VeterinariansTable />
    </Box>
  );
}
