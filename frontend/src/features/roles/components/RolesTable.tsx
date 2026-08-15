"use client";

import { useEffect, useState } from "react";
import { useRoles } from "../hooks/rolesHooks";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import { Role, ROLE_STATUS_FILTERS } from "../types/rolesTypes";
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CreateRole from "./CreateRole";
import EditRole from "./EditRole";
import DeleteRole from "./DeleteRole";
import ReactivateRole from "./ReactivateRole";

export default function RolesTable() {
  const { roles, loading, fetchRoles, error } = useRoles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("activo");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const refresh = () =>
    void fetchRoles({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: search.trim() || undefined,
      status: statusFilter,
    });

  // Fetch roles when page, rowsPerPage, search or statusFilter changes
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, statusFilter, fetchRoles]);

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

  const columns: Column<Role>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 60,
      render: (_row, index) => (page * rowsPerPage) + index + 1,
    },
    {
      id: "name",
      label: "Rol",
      minWidth: 150,
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--mui-palette-primary-main, #2ABFBF)" }}>
          {row.name}
        </span>
      ),
    },
    {
      id: "description",
      label: "Descripción",
      minWidth: 250,
    },
    {
      id: "permissionsCount",
      label: "Permisos",
      minWidth: 120,
      align: "center",
      render: (row) => (
        <Chip
          label={`${row.permissionsCount || row.permissions?.length || 0} asignados`}
          size="small"
          color="secondary"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      id: "isActive",
      label: "Estado",
      minWidth: 120,
      render: (row) => (
        <Chip
          label={row.isActive ? "Activo" : "Inactivo"}
          size="small"
          color={row.isActive ? "success" : "default"}
          sx={{
            fontWeight: 600,
            borderRadius: "6px",
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
    {
      id: "actions",
      label: "Acciones",
      minWidth: 120,
      align: "center",
      render: (row) =>
        row.isActive ? (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Tooltip title="Editar Rol">
              <IconButton
                size="small"
                color="primary"
                disabled={row.name === "SUPERADMIN"}
                onClick={() => {
                  setSelectedRole(row);
                  setEditOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar Rol">
              <IconButton
                size="small"
                color="error"
                disabled={["SUPERADMIN", "VETERINARIAN", "ADMIN", "GROOMING"].includes(row.name)}
                onClick={() => {
                  setSelectedRole(row);
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
            <Tooltip title="Reactivar Rol">
              <IconButton
                size="small"
                color="success"
                onClick={() => {
                  setSelectedRole(row);
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
      {/* Table Actions Toolbar */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            placeholder="Buscar roles..."
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
          <Tooltip title="Nuevo Rol">
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
            Nuevo Rol
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
            {ROLE_STATUS_FILTERS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Reusable table component */}
      <CustomTable<Role>
        columns={columns}
        data={roles?.results || []}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={roles?.count || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No se encontraron roles"
      />

      {/* Dialog Modals for CRUD operations */}
      {createOpen && (
        <CreateRole
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={refresh}
        />
      )}

      {editOpen && selectedRole && (
        <EditRole
          open={editOpen}
          role={selectedRole}
          onClose={() => {
            setEditOpen(false);
            setSelectedRole(null);
          }}
          onSuccess={refresh}
        />
      )}

      {deleteOpen && selectedRole && (
        <DeleteRole
          open={deleteOpen}
          role={selectedRole}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedRole(null);
          }}
          onSuccess={refresh}
        />
      )}

      {reactivateOpen && selectedRole && (
        <ReactivateRole
          open={reactivateOpen}
          role={selectedRole}
          onClose={() => {
            setReactivateOpen(false);
            setSelectedRole(null);
          }}
          onSuccess={refresh}
        />
      )}
    </Box>
  );
}
