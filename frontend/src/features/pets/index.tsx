"use client";

import { Box, Typography } from "@mui/material";
import PetTable from "./components/PetTable";

export default function PetsFeature() {
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
          Mascotas / Pacientes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona los datos de las mascotas de la clínica, su especie, raza, peso, microchip y propietario asignado.
        </Typography>
      </Box>

      {/* Pet Table */}
      <PetTable />
    </Box>
  );
}
