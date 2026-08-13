"use client";

import { useEffect, useState } from "react";
import { usePermissions } from "../hooks/permissionsHooks";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import { Permission } from "../types/rolesTypes";
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export default function PermissionsTable() {
  const { permissions, loading, fetchPermissions, error } = usePermissions();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // Fetch permissions when page, rowsPerPage or search changes
  useEffect(() => {
    fetchPermissions({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: search.trim() || undefined,
    });
  }, [page, rowsPerPage, search, fetchPermissions]);

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

  const columns: Column<Permission>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 60,
      render: (_row, index) => (page * rowsPerPage) + index + 1,
    },
    {
      id: "name",
      label: "Permiso",
      minWidth: 200,
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--mui-palette-text-primary)" }}>
          {row.name}
        </span>
      ),
    },
    {
      id: "labelEs",
      label: "Nombre en Español",
      minWidth: 200,
    },
    {
      id: "module",
      label: "Módulo",
      minWidth: 120,
      render: (row) => (
        <Chip
          label={row.module}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            borderRadius: "6px",
          }}
        />
      ),
    },
    {
      id: "action",
      label: "Acción",
      minWidth: 100,
      render: (row) => (
        <Chip
          label={row.action}
          size="small"
          sx={{
            fontWeight: 500,
            textTransform: "uppercase",
            fontSize: "0.75rem",
          }}
        />
      ),
    },
    {
      id: "createdAt",
      label: "Creación",
      minWidth: 150,
      render: (row) => {
        if (!row.createdAt) return "-";
        return new Date(row.createdAt).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      },
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Table Actions Toolbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          placeholder="Buscar permisos..."
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
            width: { xs: "100%", md: "50%" },
            maxWidth: 500,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "background.paper",
            },
          }}
        />
      </Box>

      {/* Reusable table component */}
      <CustomTable<Permission>
        columns={columns}
        data={permissions?.results || []}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={permissions?.count || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No se encontraron permisos"
      />
    </Box>
  );
}
