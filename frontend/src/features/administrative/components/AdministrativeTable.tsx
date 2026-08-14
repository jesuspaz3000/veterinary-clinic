"use client";

import { useEffect, useState } from "react";
import { useAdministrativeStaff } from "../hooks/administrativeHooks";
import CustomTable, { Column } from "@/shared/components/CustomTable";
import { ADMINISTRATIVE_STATUS_FILTERS, AdministrativeStaffResponse } from "../type/administrativeTypes";
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
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CreateAdministrativeStaff from "./CreateAdministrativeStaff";
import EditAdministrativeStaff from "./EditAdministrativeStaff";
import DeleteAdministrativeStaff from "./DeleteAdministrativeStaff";
import ReactivateAdministrativeStaff from "./ReactivateAdministrativeStaff";
import ManageAdministrativePositionsDialog from "./ManageAdministrativePositionsDialog";
import ManageAdministrativeAreasDialog from "./ManageAdministrativeAreasDialog";

export default function AdministrativeTable() {
  const { administrativeStaff, loading, fetchAdministrativeStaff, error } = useAdministrativeStaff();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("activo");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [managePositionsOpen, setManagePositionsOpen] = useState(false);
  const [manageAreasOpen, setManageAreasOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AdministrativeStaffResponse | null>(null);

  const refresh = () =>
    void fetchAdministrativeStaff({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      search: search.trim() || undefined,
      status: statusFilter,
    });

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, statusFilter, fetchAdministrativeStaff]);

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

  const columns: Column<AdministrativeStaffResponse>[] = [
    {
      id: "index",
      label: "Nº",
      minWidth: 60,
      render: (_row, index) => page * rowsPerPage + index + 1,
    },
    {
      id: "name",
      label: "Personal Administrativo",
      minWidth: 220,
      render: (row) => {
        const user = row.user;
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={user.avatarUrl || undefined}
              alt={user.username}
              sx={{ width: 40, height: 40, bgcolor: user.avatarUrl ? "transparent" : "primary.main" }}
              slotProps={{
                img: {
                  style: { objectFit: "cover" },
                  onError: (e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  },
                },
              }}
            >
              {!user.avatarUrl && (user.firstName?.charAt(0) || user.username.charAt(0)).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                {fullName || user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @{user.username}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: "positions",
      label: "Cargo(s)",
      minWidth: 180,
      render: (row) => {
        const positionsList = row.positions || [];
        if (positionsList.length === 0) return "-";
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {positionsList.map((pos) => (
              <Chip
                key={pos.id}
                label={pos.name}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ borderRadius: "6px", fontWeight: 500 }}
              />
            ))}
          </Box>
        );
      },
    },
    {
      id: "assignedArea",
      label: "Área Asignada",
      minWidth: 150,
      render: (row) => (
        row.assignedArea ? (
          <Chip
            label={row.assignedArea.name}
            size="small"
            variant="filled"
            color="default"
            sx={{ fontWeight: 600, borderRadius: "6px" }}
          />
        ) : "-"
      ),
    },
    {
      id: "contact",
      label: "Contacto",
      minWidth: 180,
      render: (row) => {
        const user = row.user;
        return (
          <Box>
            <Typography variant="body2" color="text.primary">
              {user.email}
            </Typography>
            {user.phone && (
              <Typography variant="caption" color="text.secondary">
                {user.phone}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: "status",
      label: "Estado",
      minWidth: 100,
      render: (row) => {
        const isActive = row.user.isActive;
        return (
          <Chip
            label={isActive ? "Activo" : "Inactivo"}
            size="small"
            color={isActive ? "success" : "default"}
            sx={{ fontWeight: 600, borderRadius: "6px" }}
          />
        );
      },
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 110,
      align: "center",
      render: (row) =>
        row.user.isActive ? (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Tooltip title="Editar Personal">
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setSelectedStaff(row);
                  setEditOpen(true);
                }}
                sx={{ bgcolor: "action.hover" }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar Personal">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setSelectedStaff(row);
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
            <Tooltip title="Reactivar Personal">
              <IconButton
                size="small"
                color="success"
                onClick={() => {
                  setSelectedStaff(row);
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", flexGrow: 1, maxWidth: { md: "70%" } }}>
          <TextField
            placeholder="Buscar por nombre, usuario, correo, cargo o área..."
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
              width: { xs: "100%", md: "40%" },
              maxWidth: 450,
              flexGrow: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: "background.paper",
              },
            }}
          />
          <TextField
            select
            label="Estado"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ minWidth: 160 }}
          >
            {ADMINISTRATIVE_STATUS_FILTERS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<SettingsRoundedIcon />}
            onClick={() => setManagePositionsOpen(true)}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
            }}
          >
            Gestionar Cargos
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsRoundedIcon />}
            onClick={() => setManageAreasOpen(true)}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
            }}
          >
            Gestionar Áreas
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Nuevo Personal Administrativo
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <CustomTable<AdministrativeStaffResponse>
        columns={columns}
        data={administrativeStaff?.results || []}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={administrativeStaff?.count || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No se encontró personal administrativo registrado."
      />

      {/* Modals */}
      {managePositionsOpen && (
        <ManageAdministrativePositionsDialog
          open={managePositionsOpen}
          onClose={() => setManagePositionsOpen(false)}
          onPositionChange={refresh}
        />
      )}

      {manageAreasOpen && (
        <ManageAdministrativeAreasDialog
          open={manageAreasOpen}
          onClose={() => setManageAreasOpen(false)}
          onAreaChange={refresh}
        />
      )}

      {createOpen && (
        <CreateAdministrativeStaff
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={refresh}
        />
      )}

      {editOpen && selectedStaff && (
        <EditAdministrativeStaff
          key={selectedStaff.id}
          open={editOpen}
          staff={selectedStaff}
          onClose={() => {
            setEditOpen(false);
            setSelectedStaff(null);
          }}
          onSuccess={refresh}
        />
      )}

      {deleteOpen && selectedStaff && (
        <DeleteAdministrativeStaff
          open={deleteOpen}
          staff={selectedStaff}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedStaff(null);
          }}
          onSuccess={refresh}
        />
      )}

      {reactivateOpen && selectedStaff && (
        <ReactivateAdministrativeStaff
          open={reactivateOpen}
          staff={selectedStaff}
          onClose={() => {
            setReactivateOpen(false);
            setSelectedStaff(null);
          }}
          onSuccess={refresh}
        />
      )}
    </Box>
  );
}
