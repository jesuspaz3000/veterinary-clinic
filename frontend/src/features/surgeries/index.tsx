"use client";

import { Box, Typography } from "@mui/material";
import SurgeriesTable from "./components/SurgeriesTable";

export default function SurgeriesFeature() {
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
          Cirugías
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Programa y da seguimiento a las cirugías de cada paciente: cirujano, anestesia,
          notas clínicas y estado del procedimiento.
        </Typography>
      </Box>

      {/* Surgeries Table */}
      <SurgeriesTable />
    </Box>
  );
}
