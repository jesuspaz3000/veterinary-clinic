"use client";

import { Box, Typography } from "@mui/material";
import AdministrativeTable from "./components/AdministrativeTable";

export default function AdministrativeFeature() {
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
          Personal Administrativo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona el personal administrativo, sus cargos y áreas asignadas en la clínica veterinaria.
        </Typography>
      </Box>

      {/* Administrative Staff Table */}
      <AdministrativeTable />
    </Box>
  );
}
