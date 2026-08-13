"use client";

import { Box, Typography } from "@mui/material";
import MedicalRecordsTable from "./components/MedicalRecordsTable";

export default function MedicalRecordsFeature() {
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
          Historial Clínico
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Registra y consulta las atenciones médicas de cada paciente: diagnósticos, tratamientos,
          prescripciones y documentos adjuntos.
        </Typography>
      </Box>

      {/* Medical Records Table */}
      <MedicalRecordsTable />
    </Box>
  );
}
