"use client";

import { Box, Typography } from "@mui/material";
import HospitalizationsTable from "./components/HospitalizationsTable";

export default function HospitalizationsFeature() {
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
          Hospitalización
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona los ingresos hospitalarios de cada paciente y registra su evolución diaria
          hasta el alta.
        </Typography>
      </Box>

      {/* Hospitalizations Table */}
      <HospitalizationsTable />
    </Box>
  );
}
