"use client";

import { Box, Typography } from "@mui/material";
import UsersTable from "./components/UsersTable";

export default function UsersFeature() {
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
          Usuarios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona los usuarios del sistema, sus roles y permisos asignados.
        </Typography>
      </Box>

      {/* Users Table */}
      <UsersTable />
    </Box>
  );
}
