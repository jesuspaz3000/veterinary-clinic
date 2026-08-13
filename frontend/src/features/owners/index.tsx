"use client";

import { Box, Typography } from "@mui/material";
import OwnerTable from "./components/OwnerTable";

export default function OwnersFeature() {
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
          Dueños / Clientes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona los clientes de la veterinaria, su información de contacto, documentos y datos registrados.
        </Typography>
      </Box>

      {/* Owners Table */}
      <OwnerTable />
    </Box>
  );
}
