"use client";

import { Box, Typography } from "@mui/material";
import GroomingTable from "./components/GroomingTable";

export default function GroomingFeature() {
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
          Grooming & Peluquería
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona el personal de estética canina y felina, sus especialidades de corte y años de experiencia.
        </Typography>
      </Box>

      {/* Grooming Staff Table */}
      <GroomingTable />
    </Box>
  );
}
