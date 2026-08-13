"use client";

import { useEffect, useState } from "react";
import { useInventoryMovements } from "../hooks/useInventoryMovements";
import { ProductsService } from "@/features/products/service/products.service";
import { InventoryMovementResponse } from "../types/salesTypes";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
  Alert,
} from "@mui/material";

interface VariantOption {
  id: string;
  label: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "p. m." : "a. m.";
  hours = hours % 12 || 12;

  return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
}

function formatMotivo(movementType: string, notes?: string | null): string {
  switch (movementType) {
    case "ajuste_ingreso":
      if (notes && notes.toLowerCase().includes("lote")) return "Ingreso Lote";
      return "Adición Manual";
    case "ajuste_salida":
      return "Ajuste Salida";
    case "venta":
      return "Venta";
    case "devolucion":
      return "Devolución";
    case "merma_vencimiento":
      return "Merma Vencimiento";
    case "compra":
      return "Compra Ingreso";
    default:
      if (notes && notes.trim()) return notes;
      return movementType ? movementType.charAt(0).toUpperCase() + movementType.slice(1) : "Ajuste";
  }
}

function formatVariantName(row: InventoryMovementResponse): { name: string; sku: string } {
  let name = "";
  if (row.productName && row.variantName) {
    if (row.productName.toLowerCase() === row.variantName.toLowerCase()) {
      name = row.productName;
    } else {
      name = `${row.productName} / ${row.variantName}`;
    }
  } else {
    name = row.variantName || row.productName || "Producto";
  }

  const sku = row.sku ? `(SKU: ${row.sku})` : "";
  return { name, sku };
}

export default function KardexTable() {
  const { movements, totalCount, loading, error, setFilters } = useInventoryMovements();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedVariant, setSelectedVariant] = useState("all");
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);

  useEffect(() => {
    ProductsService.getAllProducts()
      .then((res) => {
        const opts: VariantOption[] = [];
        res.results.forEach((p) => {
          p.variants?.forEach((v) => {
            opts.push({
              id: v.id,
              label: `${p.name} - ${v.name} (SKU: ${v.sku || "S/N"})`,
            });
          });
        });
        setVariantOptions(opts);
      })
      .catch((err) => {
        console.error("Error al cargar variantes para filtro de Kardex:", err);
      });
  }, []);

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
    setFilters((prev) => ({ ...prev, offset: newPage * rowsPerPage }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0);
    setFilters((prev) => ({ ...prev, limit: newLimit, offset: 0 }));
  };

  const handleVariantFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setSelectedVariant(val);
    setPage(0);
    setFilters((prev) => ({
      ...prev,
      variantId: val !== "all" ? val : undefined,
      offset: 0,
    }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Top Bar: Title & Variant Filter */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
          Kardex de Inventario
        </Typography>

        <TextField
          select
          size="small"
          label="Filtrar por variante"
          value={selectedVariant}
          onChange={handleVariantFilterChange}
          sx={{
            minWidth: 240,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "background.paper",
            },
          }}
        >
          <MenuItem value="all">Todas las variantes</MenuItem>
          {variantOptions.map((opt) => (
            <MenuItem key={opt.id} value={opt.id}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Error state */}
      {Boolean(error) && (
        <Alert severity="error" sx={{ borderRadius: "8px" }}>
          {String(error)}
        </Alert>
      )}

      {/* Table Paper Container matching CustomTable */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: (theme) =>
            theme.palette.mode === "light" ? "rgba(26, 153, 153, 0.2)" : "divider",
          bgcolor: "background.paper",
          backdropFilter: "blur(8px)",
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ maxHeight: 680 }}>
          <Table stickyHeader aria-label="tabla kardex inventario">
            <TableHead>
              {/* Header Row 1: Groups */}
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "background.default",
                    color: "text.primary",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 150,
                    py: 2,
                    px: 2,
                  }}
                >
                  Fecha y Hora
                </TableCell>
                <TableCell
                  rowSpan={2}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "background.default",
                    color: "text.primary",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 200,
                    py: 2,
                    px: 2,
                  }}
                >
                  Variante
                </TableCell>
                <TableCell
                  rowSpan={2}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "background.default",
                    color: "text.primary",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 150,
                    py: 2,
                    px: 2,
                  }}
                >
                  Detalle / Motivo
                </TableCell>

                {/* Entradas Group Header */}
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(46, 125, 50, 0.18)",
                    color: "success.main",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    py: 1.5,
                    px: 2,
                  }}
                >
                  Entradas
                </TableCell>

                {/* Salidas Group Header */}
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(211, 47, 47, 0.18)",
                    color: "error.main",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    py: 1.5,
                    px: 2,
                  }}
                >
                  Salidas (Ventas / Retiros)
                </TableCell>

                {/* Saldos Group Header */}
                <TableCell
                  colSpan={2}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(25, 118, 210, 0.18)",
                    color: "info.main",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    py: 1.5,
                    px: 2,
                  }}
                >
                  Saldos (Stock)
                </TableCell>

                <TableCell
                  rowSpan={2}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "background.default",
                    color: "text.primary",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 140,
                    py: 2,
                    px: 2,
                  }}
                >
                  Responsable
                </TableCell>
              </TableRow>

              {/* Header Row 2: Sub-columns */}
              <TableRow>
                {/* Entradas sub-headers */}
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(46, 125, 50, 0.12)",
                    color: "success.main",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 70,
                    py: 1.5,
                    px: 1.5,
                  }}
                >
                  Cant.
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(46, 125, 50, 0.12)",
                    color: "success.main",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 90,
                    py: 1.5,
                    px: 1.5,
                  }}
                >
                  C.U.
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(46, 125, 50, 0.12)",
                    color: "success.main",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 100,
                    py: 1.5,
                    px: 1.5,
                  }}
                >
                  Total
                </TableCell>

                {/* Salidas sub-headers */}
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(211, 47, 47, 0.12)",
                    color: "error.main",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 70,
                    py: 1.5,
                    px: 1.5,
                  }}
                >
                  Cant.
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(211, 47, 47, 0.12)",
                    color: "error.main",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 90,
                    py: 1.5,
                    px: 1.5,
                  }}
                >
                  C.U.
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(211, 47, 47, 0.12)",
                    color: "error.main",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 100,
                    py: 1.5,
                    px: 1.5,
                  }}
                >
                  Total
                </TableCell>

                {/* Saldos sub-headers */}
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(25, 118, 210, 0.12)",
                    color: "info.main",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 70,
                    py: 1.5,
                    px: 1.5,
                  }}
                >
                  Cant.
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(25, 118, 210, 0.12)",
                    color: "info.main",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    minWidth: 110,
                    py: 1.5,
                    px: 1.5,
                  }}
                >
                  Val. Total
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} color="primary" />
                    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                      Cargando movimientos del Kardex...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No se encontraron movimientos registrados en el Kardex.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((row: InventoryMovementResponse) => {
                  const isEntry = row.quantity > 0;
                  const isExit = row.quantity < 0;
                  const unitPrice = row.unitPrice || 0;
                  const absQty = Math.abs(row.quantity);

                  const entryCant = isEntry ? `+${row.quantity}` : "—";
                  const entryCU = isEntry && unitPrice > 0 ? `S/ ${unitPrice.toFixed(2)}` : "—";
                  const entryTotal = isEntry && unitPrice > 0 ? `S/ ${(row.quantity * unitPrice).toFixed(2)}` : "—";

                  const exitCant = isExit ? `${row.quantity}` : "—";
                  const exitCU = isExit && unitPrice > 0 ? `S/ ${unitPrice.toFixed(2)}` : "—";
                  const exitTotal = isExit && unitPrice > 0 ? `S/ ${(absQty * unitPrice).toFixed(2)}` : "—";

                  const stockTotalVal = row.newStock * unitPrice;

                  const userNameClean =
                    !row.userName || row.userName.toLowerCase() === "null null"
                      ? "Super Admin"
                      : row.userName;

                  const { name: vName, sku: vSku } = formatVariantName(row);

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        "&:hover": { bgcolor: "action.hover" },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      {/* Fecha y Hora */}
                      <TableCell sx={{ fontSize: "0.875rem", color: "text.primary", py: 2, px: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                        {formatDate(row.createdAt)}
                      </TableCell>

                      {/* Variante */}
                      <TableCell sx={{ fontSize: "0.875rem", py: 2, px: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                        <Box component="span" sx={{ fontWeight: 700, color: "text.primary", mr: 0.5 }}>
                          {vName}
                        </Box>
                        {vSku && (
                          <Box component="span" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                            {vSku}
                          </Box>
                        )}
                      </TableCell>

                      {/* Detalle / Motivo */}
                      <TableCell sx={{ fontSize: "0.875rem", color: "text.primary", py: 2, px: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                        {formatMotivo(row.movementType, row.notes)}
                      </TableCell>

                      {/* ENTRADAS */}
                      <TableCell
                        align="right"
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: isEntry ? 700 : 400,
                          color: isEntry ? "success.main" : "text.secondary",
                          py: 2,
                          px: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {entryCant}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontSize: "0.875rem",
                          color: isEntry ? "text.primary" : "text.secondary",
                          py: 2,
                          px: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {entryCU}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: isEntry ? 700 : 400,
                          color: isEntry ? "success.main" : "text.secondary",
                          py: 2,
                          px: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {entryTotal}
                      </TableCell>

                      {/* SALIDAS */}
                      <TableCell
                        align="right"
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: isExit ? 700 : 400,
                          color: isExit ? "error.main" : "text.secondary",
                          py: 2,
                          px: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {exitCant}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontSize: "0.875rem",
                          color: isExit ? "text.primary" : "text.secondary",
                          py: 2,
                          px: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {exitCU}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: isExit ? 700 : 400,
                          color: isExit ? "error.main" : "text.secondary",
                          py: 2,
                          px: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {exitTotal}
                      </TableCell>

                      {/* SALDOS (STOCK) */}
                      <TableCell
                        align="right"
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 800,
                          color: "text.primary",
                          py: 2,
                          px: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {row.newStock}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "warning.main",
                          py: 2,
                          px: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {unitPrice > 0 ? `S/ ${stockTotalVal.toFixed(2)}` : "—"}
                      </TableCell>

                      {/* Responsable */}
                      <TableCell sx={{ fontSize: "0.875rem", color: "text.primary", py: 2, px: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                        {userNameClean}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        />
      </Paper>
    </Box>
  );
}
