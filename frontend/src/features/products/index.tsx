"use client";

import { Box, Typography } from "@mui/material";
import ProductsTable from "./components/ProductsTable";

export default function ProductsModule() {
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
          Gestión de Productos e Inventario
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra productos, presentaciones/variantes, farmacia veterinaria, precios y alertas de stock.
        </Typography>
      </Box>

      {/* Products Table */}
      <ProductsTable />
    </Box>
  );
}
