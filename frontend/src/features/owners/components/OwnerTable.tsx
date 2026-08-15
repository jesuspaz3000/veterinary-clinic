"use client";

import { useEffect, useState } from "react";
import { useOwners } from "../hooks/useOwners";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import { OWNER_STATUS_FILTERS, OwnerResponse } from "../type/ownersTypes";
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Avatar,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PetsRoundedIcon from "@mui/icons-material/PetsRounded";
import CreateOwnerDialog from "./CreateOwnerDialog";
import EditOwnerDialog from "./EditOwnerDialog";
import DeleteOwnerDialog from "./DeleteOwnerDialog";
import ReactivateOwnerDialog from "./ReactivateOwnerDialog";

export default function OwnerTable() {
  const { owners, loading, fetchOwners, error } = useOwners();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("activo");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<OwnerResponse | null>(null);

  const refresh = () =>
    void fetchOwners({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: search.trim() || undefined,
      status: statusFilter,
    });

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, statusFilter, fetchOwners]);

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

  const columns: Column<OwnerResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 60,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "name",
      label: "Cliente",
      minWidth: 220,
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{ width: 40, height: 40, bgcolor: "primary.main", fontWeight: 700 }}
          >
            {(row.firstName?.charAt(0) || "C").toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {row.fullName}
            </Typography>
            {row.email && (
              <Typography variant="caption" color="text.secondary">
                {row.email}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: "document",
      label: "N° Documento",
      minWidth: 150,
      render: (row) => (
        row.documentNumber ? (
          <Chip
            label={`${row.documentType || "DNI"}: ${row.documentNumber}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, borderRadius: "6px" }}
          />
        ) : "-"
      ),
    },
    {
      id: "contact",
      label: "Contacto",
      minWidth: 180,
      render: (row) => (
        <Box>
          <Typography variant="body2" color="text.primary">
            {row.phone}
          </Typography>
          {row.address && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                maxWidth: 220,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whitespace: "nowrap",
              }}
            >
              {row.address}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "pets",
      label: "Mascotas",
      minWidth: 120,
      render: (row) => (
        <Chip
          icon={<PetsRoundedIcon sx={{ fontSize: "1rem !important" }} />}
          label={`${row.petsCount || 0}`}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ fontWeight: 600, borderRadius: "6px" }}
        />
      ),
    },
    {
      id: "status",
      label: "Estado",
      minWidth: 100,
      render: (row) => (
        <Chip
          label={row.isActive ? "Activo" : "Inactivo"}
          size="small"
          color={row.isActive ? "success" : "default"}
          sx={{ fontWeight: 600, borderRadius: "6px" }}
        />
      ),
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 110,
      align: "center",
      render: (row) =>
        row.isActive ? (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Tooltip title="Editar Cliente">
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setSelectedOwner(row);
                  setEditOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Desactivar Cliente">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setSelectedOwner(row);
                  setDeleteOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Tooltip title="Reactivar Cliente">
              <IconButton
                size="small"
                color="success"
                onClick={() => {
                  setSelectedOwner(row);
                  setReactivateOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <RestoreRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Table Toolbar */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            placeholder="Buscar cliente..."
            value={search}
            onChange={handleSearchChange}
            size="small"
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
              flex: "1 1 auto",
              maxWidth: { sm: 600 },
              "& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
            }}
          />
          <Tooltip title="Nuevo Cliente">
            <IconButton
              onClick={() => setCreateOpen(true)}
              sx={{
                display: { xs: "inline-flex", sm: "none" },
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: 1,
                flexShrink: 0,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              flexShrink: 0,
            }}
          >
            Nuevo Cliente
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <TextField
            select
            label="Estado"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ width: { xs: "100%", sm: 200 } }}
          >
            {OWNER_STATUS_FILTERS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Table */}
      <CustomTable<OwnerResponse>
        columns={columns}
        data={owners?.results || []}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={owners?.count || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No se encontraron clientes registrados."
      />

      {/* Modals */}
      {createOpen && (
        <CreateOwnerDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={refresh}
        />
      )}

      {editOpen && selectedOwner && (
        <EditOwnerDialog
          key={selectedOwner.id}
          open={editOpen}
          owner={selectedOwner}
          onClose={() => {
            setEditOpen(false);
            setSelectedOwner(null);
          }}
          onSuccess={refresh}
        />
      )}

      {reactivateOpen && selectedOwner && (
        <ReactivateOwnerDialog
          open={reactivateOpen}
          owner={selectedOwner}
          onClose={() => {
            setReactivateOpen(false);
            setSelectedOwner(null);
          }}
          onSuccess={refresh}
        />
      )}

      {deleteOpen && selectedOwner && (
        <DeleteOwnerDialog
          open={deleteOpen}
          owner={selectedOwner}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedOwner(null);
          }}
          onSuccess={refresh}
        />
      )}
    </Box>
  );
}
