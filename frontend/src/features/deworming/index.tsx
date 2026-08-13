"use client";

import { Box, Typography } from "@mui/material";
import DewormingTable from "./components/DewormingTable";

export default function DewormingFeature() {
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
          Control de Desparasitación
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Registra los tratamientos antiparasitarios aplicados a cada paciente y da seguimiento a las
          próximas aplicaciones pendientes.
        </Typography>
      </Box>

      {/* Deworming Table */}
      <DewormingTable />
    </Box>
  );
}
