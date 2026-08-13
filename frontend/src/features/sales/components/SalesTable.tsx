"use client";

import { useEffect, useState } from "react";
import { useSales } from "../hooks/useSales";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import { InvoiceResponse } from "../types/salesTypes";
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Button,
  MenuItem,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoneyOffRoundedIcon from "@mui/icons-material/MoneyOffRounded";
import CreateInvoiceDialog from "./CreateInvoiceDialog";
import InvoiceDetailDialog from "./InvoiceDetailDialog";
import CreateCreditNoteDialog from "./CreateCreditNoteDialog";

const INVOICE_TYPES_FILTER = [
  { value: "all", label: "Todos los Comprobantes" },
  { value: "boleta", label: "Boletas" },
  { value: "factura", label: "Facturas" },
  { value: "ticket", label: "Tickets Mostrador" },
];

const PAYMENT_STATUS_FILTER = [
  { value: "all", label: "Todos los Estados" },
  { value: "pagado", label: "Pagados" },
  { value: "anulado", label: "Anulados" },
];

export default function SalesTable() {
  const { invoices, totalCount, loading, error, reload, setFilters } = useSales();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [invoiceType, setInvoiceType] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [creditNoteOpen, setCreditNoteOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);

  useEffect(() => {
    setFilters({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: search.trim() || undefined,
      invoiceType: invoiceType !== "all" ? invoiceType : undefined,
      paymentStatus: paymentStatus !== "all" ? paymentStatus : undefined,
    });
  }, [page, rowsPerPage, search, invoiceType, paymentStatus, setFilters]);

  const handlePageChange = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const columns: Column<InvoiceResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 60,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "invoiceNumber",
      label: "Comprobante",
      minWidth: 160,
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ fontWeight: 700 }}>{row.invoiceNumber}</Box>
          <Chip
            label={row.invoiceType.toUpperCase()}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 700, fontSize: "0.7rem", height: 20 }}
          />
        </Box>
      ),
    },
    {
      id: "issuedAt",
      label: "Fecha / Hora",
      minWidth: 160,
      render: (row) => new Date(row.issuedAt).toLocaleString(),
    },
    {
      id: "ownerName",
      label: "Cliente / Propietario",
      minWidth: 190,
      render: (row) =>
        row.ownerName
          ? `${row.ownerName} (${row.ownerDocumentNumber || "S/D"})`
          : "Cliente Genérico (Venta Mostrador)",
    },
    {
      id: "userName",
      label: "Cajero / Usuario",
      minWidth: 150,
      render: (row) => {
        if (!row.userName || row.userName.toLowerCase() === "null null") {
          return "Usuario Sistema";
        }
        return row.userName;
      },
    },
    {
      id: "total",
      label: "Total (S/.)",
      minWidth: 120,
      render: (row) => (
        <Box sx={{ fontWeight: 800, color: "primary.main" }}>
          S/. {row.total.toFixed(2)}
        </Box>
      ),
    },
    {
      id: "paymentStatus",
      label: "Estado",
      minWidth: 120,
      render: (row) => {
        const isAnulado = row.paymentStatus.toLowerCase() === "anulado";
        return (
          <Chip
            label={isAnulado ? "ANULADO" : "PAGADO"}
            size="small"
            color={isAnulado ? "error" : "success"}
            variant="filled"
            sx={{ fontWeight: 700, borderRadius: "6px" }}
          />
        );
      },
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 110,
      render: (row) => {
        const isAnulado = row.paymentStatus.toLowerCase() === "anulado";

        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Ver Detalle de Venta">
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedInvoice(row);
                  setDetailOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <VisibilityRoundedIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>

            {!isAnulado && (
              <Tooltip title="Emitir Nota de Crédito / Anular">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedInvoice(row);
                    setCreditNoteOpen(true);
                  }}
                  sx={{ bgcolor: "action.hover" }}
                >
                  <MoneyOffRoundedIcon fontSize="small" color="warning" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Table Actions Toolbar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              placeholder="Buscar por N° comprobante o notas..."
              variant="outlined"
              size="small"
              value={search}
              onChange={handleSearchChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: { xs: "100%", sm: "340px", md: "400px" },
                minWidth: 320,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: "background.paper",
                },
              }}
            />

            <TextField
              select
              size="small"
              value={invoiceType}
              onChange={(e) => {
                setInvoiceType(e.target.value);
                setPage(0);
              }}
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: "background.paper",
                },
              }}
            >
              {INVOICE_TYPES_FILTER.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(0);
              }}
              sx={{
                minWidth: 180,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: "background.paper",
                },
              }}
            >
              {PAYMENT_STATUS_FILTER.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Nueva Venta (POS)
          </Button>
        </Box>

        {/* Custom Table */}
        <CustomTable<InvoiceResponse>
          columns={columns}
          data={invoices}
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          loading={loading}
          error={error}
        />
      </Box>

      {/* Dialog Modals */}
      <CreateInvoiceDialog open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={() => void reload()} />

      <InvoiceDetailDialog open={detailOpen} invoice={selectedInvoice} onClose={() => setDetailOpen(false)} />

      <CreateCreditNoteDialog
        open={creditNoteOpen}
        invoice={selectedInvoice}
        onClose={() => setCreditNoteOpen(false)}
        onSuccess={() => void reload()}
      />
    </>
  );
}
