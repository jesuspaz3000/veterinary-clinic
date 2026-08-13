"use client";

import { Box, Typography } from "@mui/material";
import SchedulesManager from "./components/SchedulesManager";

export default function SchedulesFeature() {
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
          Horarios del Personal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Define los días y horas de atención de veterinarios y personal de grooming. Estos
          horarios sirven como referencia para la programación de citas.
        </Typography>
      </Box>

      <SchedulesManager />
    </Box>
  );
}
