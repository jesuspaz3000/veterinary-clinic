"use client";

import { Box, Typography } from "@mui/material";
import VaccinationsTable from "./components/VaccinationsTable";

export default function VaccinationsFeature() {
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
          Control de Vacunación
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Registra las vacunas aplicadas a cada paciente y da seguimiento a las próximas dosis
          pendientes.
        </Typography>
      </Box>

      {/* Vaccinations Table */}
      <VaccinationsTable />
    </Box>
  );
}
